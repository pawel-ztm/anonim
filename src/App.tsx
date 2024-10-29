import React, { useRef, useState } from 'react';
import Konva from 'konva';
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Image as KonvaImage,
} from 'react-konva';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import { useImage } from 'react-konva-utils';
// import jsPDF from 'jspdf';
import {
  Button,
  Container,
  Form,
  OverlayTrigger,
  Row,
  Tooltip,
} from 'react-bootstrap';
import jsPDF from 'jspdf';
import LoadingSpinner from './componenst/LoadingSpinner';
import './App.css';
import UndoIcon from './icons/UndoIcon';
import EraserIcon from './icons/EraserIcon';
import FloppyIcon from './icons/FloppyIcon';

interface RectProps {
  id: string; // Zmiana na 'string'
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const App: React.FC = () => {
  // const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [pdfPages, setPdfPages] = useState<
    { src: string; width: number; height: number }[]
  >([]);
  const [rects, setRects] = useState<RectProps[]>([]);
  const [history, setHistory] = useState<RectProps[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [startExport, setStartExport] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(
    null
  );
  // const stageRefs = useRef<any[]>([]);
  const transformerRef = useRef<any>(null);
  const stageRef = useRef<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        setLoading(true);
        if (ev.target?.result) {
          const typedArray = new Uint8Array(ev.target.result as ArrayBuffer);
          const pdfDoc = await pdfjsLib.getDocument({ data: typedArray })
            .promise;

          const numPages = pdfDoc.numPages;
          const pages: { src: string; width: number; height: number }[] = [];

          // Set higher scale for better quality
          const scale = 1.8; // Increased from default 1.0

          for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;

            // Set canvas dimensions to match scaled viewport
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            // Set higher pixel density
            const outputScale = window.devicePixelRatio || 1;
            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);
            canvas.style.width = Math.floor(viewport.width) + 'px';
            canvas.style.height = Math.floor(viewport.height) + 'px';

            const transform =
              outputScale !== 1
                ? [outputScale, 0, 0, outputScale, 0, 0]
                : undefined;

            await page.render({
              canvasContext: context,
              viewport,
              transform,
            }).promise;

            // Convert to high quality WebP
            const webpImage = await convertToWebP(
              canvas.toDataURL('image/png', 1.0)
            );

            pages.push({
              src: webpImage as string,
              width: viewport.width,
              height: viewport.height,
            });
          }
          setLoading(false);
          setPdfPages(pages);
        }
      };
      setFileName(file.name);
      reader.readAsArrayBuffer(file);
    }
  };

  const convertToWebP = async (imageDataUrl: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageDataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Use original dimensions multiplied by a quality factor
        const qualityFactor = 1.5;
        canvas.width = img.width * qualityFactor;
        canvas.height = img.height * qualityFactor;

        const ctx = canvas.getContext('2d', {
          alpha: false,
          desynchronized: true,
          willReadFrequently: true,
        })!;

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const webpDataUrl = canvas.toDataURL('image/webp', 1.0);
        resolve(webpDataUrl);
      };
    });
  };

  const handleMouseDown = (e: any) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setIsDrawing(true);
      setStartPoint({ x: pos.x, y: pos.y });
      removeTempRect();
    }
  };

  // const handleMouseMove = (e: any, page: number) => {
  //   if (!isDrawing || !startPoint) return;

  //   const pos = e.target.getStage()?.getPointerPosition();
  //   if (pos) {
  //     const newRect = {
  //       id: 'temp',
  //       x: startPoint.x,
  //       y: startPoint.y,
  //       width: pos.x - startPoint.x,
  //       height: pos.y - startPoint.y,
  //       page,
  //     };

  //     setRects((prev) => {
  //       const updated = [...prev];
  //       updated.pop();
  //       updated.push(newRect);
  //       return updated;
  //     });
  //   }
  // };

  const handleMouseMove = (e: any, page: number) => {
    if (!isDrawing || !startPoint) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      const permanentRects = rects.filter((rect) => rect.id !== 'temp');
      removeTempRect();
      const newRect = {
        id: 'temp',
        x: startPoint.x,
        y: startPoint.y,
        width: pos.x - startPoint.x,
        height: pos.y - startPoint.y,
        page,
      };

      setRects([...permanentRects, newRect]);
    }
  };

  const handleMouseUp = (e: any, page: number) => {
    if (!isDrawing || !startPoint) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      removeTempRect();
      const newRect = {
        id: rects.length.toString(),
        x: startPoint.x,
        y: startPoint.y,
        width: pos.x - startPoint.x,
        height: pos.y - startPoint.y,
        page,
      };

      setRects((prev) => [...prev, newRect]);

      setHistory([...rects, newRect]);
    }

    setIsDrawing(false); // Upewnij się, że rysowanie się kończy
    setStartPoint(null);
  };

  const removeTempRect = () => {
    const permanentRects = rects.filter((rect) => rect.id !== 'temp');
    setRects(permanentRects);
  };
  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleExport = async () => {
    setStartExport(true);

    const pdfDoc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt', // Use points for more precise sizing
      format: [pdfPages[0].width, pdfPages[0].height], // Match first page dimensions
    });

    for (const [index, src] of pdfPages.entries()) {
      if (index > 0) {
        pdfDoc.addPage([src.width, src.height]); // Match each page dimensions
      }

      const img = new Image();
      img.src = src.src;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Add image at full size
      pdfDoc.addImage(img, 'WEBP', 0, 0, src.width, src.height);

      // Draw rectangles at their original positions and sizes
      const rectsOnPage = rects.filter((rect) => rect.page === index);
      for (const rect of rectsOnPage) {
        pdfDoc.setFillColor(0, 0, 0);
        pdfDoc.rect(rect.x, rect.y, rect.width, rect.height, 'F');
      }
    }

    const pdfBytes = pdfDoc.output('blob');
    const url = URL.createObjectURL(pdfBytes);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-anonymized.pdf`;
    setStartExport(false);
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUndo = () => {
    if (rects.length <= 0) return;
    console.log('undo');
    const updatedRecst = rects.slice(0, -1);
    setRects(updatedRecst);
    setHistory(updatedRecst);
  };

  const handleClear = () => {
    setRects([]);
    setHistory([]);
  };

  if (loading) return <LoadingSpinner message="Ładowanie pliku PDF..." />;
  if (startExport)
    return <LoadingSpinner message="Przygotowywanie pliku PDF..." />;

  const handleExportAllToPNG = async () => {
    if (!stageRef.current) return;

    for (let index = 0; index < pdfPages.length; index++) {
      // Create a temporary stage for each page
      const tempStage = new Konva.Stage({
        container: document.createElement('div'),
        width: pdfPages[index].width,
        height: pdfPages[index].height,
      });

      const layer = new Konva.Layer();
      tempStage.add(layer);

      // Add the page image
      const img = new Image();
      img.src = pdfPages[index].src;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imageNode = new Konva.Image({
        image: img,
        width: pdfPages[index].width,
        height: pdfPages[index].height,
      });
      layer.add(imageNode);

      // Add rectangles for this page
      rects
        .filter((rect) => rect.page === index)
        .forEach((rect) => {
          const rectNode = new Konva.Rect({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            fill: 'black',
          });
          layer.add(rectNode);
        });

      // Generate PNG for this page
      const dataURL = tempStage.toDataURL({
        mimeType: 'image/png',
        pixelRatio: 2,
        quality: 1,
      });

      // Download the PNG
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${fileName || 'annotated'}_page_${index + 1}.png`;
      link.click();

      // Clean up
      tempStage.destroy();
    }
  };

  console.log('history', history);

  const handleExportWebP = async () => {
    setStartExport(true);

    for (let index = 0; index < pdfPages.length; index++) {
      const tempStage = new Konva.Stage({
        container: document.createElement('div'),
        width: pdfPages[index].width,
        height: pdfPages[index].height,
      });

      const layer = new Konva.Layer();
      tempStage.add(layer);

      // Add the page image
      const img = new Image();
      img.src = pdfPages[index].src;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const imageNode = new Konva.Image({
        image: img,
        width: pdfPages[index].width,
        height: pdfPages[index].height,
      });
      layer.add(imageNode);

      // Add rectangles for this page
      rects
        .filter((rect) => rect.page === index)
        .forEach((rect) => {
          const rectNode = new Konva.Rect({
            x: rect.x,
            y: rect.y,
            width: rect.width,
            height: rect.height,
            fill: 'black',
          });
          layer.add(rectNode);
        });

      // Generate WebP with high quality
      const dataURL = tempStage.toDataURL({
        mimeType: 'image/webp',
        quality: 1,
        pixelRatio: 2,
      });

      // Download the WebP
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = `${fileName || 'annotated'}_page_${index + 1}.webp`;
      link.click();

      tempStage.destroy();
    }

    setStartExport(false);
  };

  return (
    <div>
      <Container className="bg-light">
        <Row className="d-flex justify-content-center align-items-center">
          <h1>Anonimizacja PDF</h1>
          <Form.Control
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="my-3"
          />
          {pdfPages.length > 0 && (
            <div className="anonimize-buttons ">
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="top"
                overlay={<Tooltip>Cofnij</Tooltip>}
              >
                <button
                  onClick={() => handleUndo()}
                  className="anonim-btn anonim-btn-success"
                >
                  <UndoIcon />
                </button>
              </OverlayTrigger>
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="top"
                overlay={<Tooltip>Wyczyść</Tooltip>}
              >
                <button
                  onClick={handleClear}
                  className="anonim-btn anonim-btn-info"
                >
                  <EraserIcon />
                </button>
              </OverlayTrigger>
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="top"
                overlay={<Tooltip>Zpiasz</Tooltip>}
              >
                <button
                  onClick={handleExport}
                  className="anonim-btn anonim-btn-danger"
                  disabled={pdfPages.length === 0}
                >
                  <FloppyIcon />
                </button>
              </OverlayTrigger>
              <OverlayTrigger
                trigger={['hover', 'focus']}
                placement="top"
                overlay={<Tooltip>Export to WebP</Tooltip>}
              >
                <Button onClick={handleExportWebP} className="ms-2">
                  WebP
                </Button>
              </OverlayTrigger>
              <Button onClick={handleExportAllToPNG}>PNG</Button>
            </div>
          )}

          {pdfPages.map((page, index) => (
            <div key={index} className="d-flex justify-content-center">
              <Stage
                // key={index}
                width={page.width}
                height={page.height}
                // ref={(el) => (stageRefs.current[index] = el)}
                // onClick={(e) => handleStageClick(e, index)}
                onMouseDown={(e) => handleMouseDown(e)}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseUp={(e) => handleMouseUp(e, index)}
                style={{ border: '1px solid black' }}
                ref={stageRef}
                pixelRatio={window.devicePixelRatio || 2}
                imageSmoothingEnabled={true}
                perfectDrawEnabled={true}
              >
                <Layer className="border">
                  <PdfPageImage
                    src={page.src}
                    width={page.width}
                    height={page.height}
                  />
                  {rects
                    .filter((rect) => rect.page === index)
                    .map((rect, i) => (
                      <Rect
                        key={i}
                        {...rect}
                        fill="black"
                        draggable
                        onClick={() => handleSelect(rect.id)} // Bez zmian, 'id' jest już typu 'string'
                        ref={selectedId === rect.id ? transformerRef : null}
                      />
                    ))}
                  {isDrawing && startPoint && (
                    <Rect
                      x={startPoint.x}
                      y={startPoint.y}
                      width={rects[rects.length - 1]?.width || 0} // Użyj ostatniego prostokąta
                      height={rects[rects.length - 1]?.height || 0} // Użyj ostatniego prostokąta
                      fill="black"
                      opacity={0.5} // Tymczasowy prostokąt
                    />
                  )}
                  {selectedId && (
                    <Transformer
                      ref={transformerRef}
                      boundBoxFunc={(newBox) => newBox}
                    />
                  )}
                </Layer>
              </Stage>
            </div>
          ))}
        </Row>
      </Container>
    </div>
  );
};

const PdfPageImage = ({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) => {
  const [image] = useImage(src); // Dynamiczne źródło dla każdej strony
  return <KonvaImage image={image} x={0} y={0} width={width} height={height} />;
};

export default App;
