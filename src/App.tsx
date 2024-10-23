import React, { useMemo, useRef, useState } from 'react';
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
import { PDFDocument, rgb } from 'pdf-lib';
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
  const [originalPdfData, setOriginalPdfData] = useState<Uint8Array | null>(
    null
  );
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

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (file && file.type === 'application/pdf') {
  //     const reader = new FileReader();
  //     reader.onload = (ev) => {
  //       if (ev.target?.result) {
  //         const typedArray = new Uint8Array(ev.target.result as ArrayBuffer);
  //         // const test = new ArrayBuffer(ev.target.result as ArrayBuffer);
  //         // setOriginalPdfData(typedArray); // Przechowaj oryginalne dane PDF
  //         // console.log(originalPdfData);
  //         // loadPdf(typedArray); // Ładujemy PDF do podglądu
  //         const pdfDoc = await pdfjsLib.getDocument({ data: typedArray })
  //           .promise;

  //         const numPages = pdfDoc.numPages;
  //         const pages = [];

  //         for (let i = 1; i <= numPages; i++) {
  //           const page = await pdfDoc.getPage(i);
  //           const viewport = page.getViewport({ scale: 1 });
  //         }
  //       }
  //     };
  //     setFileName(file.name);
  //     reader.readAsArrayBuffer(file);
  //   } else {
  //     alert('Wybrany plik nie jest plikiem PDF.');
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const typedArray = new Uint8Array(ev.target.result as ArrayBuffer);
          const pdfDoc = await pdfjsLib.getDocument({ data: typedArray })
            .promise;

          const numPages = pdfDoc.numPages;
          const pages: { src: string; width: number; height: number }[] = [];

          for (let i = 1; i <= numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({ scale: 1 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d')!;
            canvas.width = viewport.width;
            canvas.height = viewport.height;

            await page.render({ canvasContext: context, viewport }).promise;

            // Konwersja obrazu canvas na WebP
            const webpImage = await convertToWebP(canvas.toDataURL());

            pages.push({
              src: webpImage as string,
              width: canvas.width,
              height: canvas.height,
            });
          }

          setPdfPages(pages);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };
  const convertToWebP = async (imageDataUrl: string) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = imageDataUrl;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const webpDataUrl = canvas.toDataURL('image/webp', 1.0);
        resolve(webpDataUrl);
      };
    });
  };

  const loadPdf = async (pdfData: Uint8Array) => {
    setLoading(true);

    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    // const pages: string[] = [];
    const pages: { src: string; width: number; height: number }[] = [];
    // const scale = 2.0;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);

      const viewport = page.getViewport({ scale: 1 });
      const scale = 1;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height * scale;
        canvas.width = viewport.width * scale;
        context.scale(scale, scale);
        await page.render({ canvasContext: context, viewport }).promise;
        pages.push({
          src: canvas.toDataURL('image/png'),
          width: viewport.width,
          height: viewport.height,
        });
      }
    }
    setLoading(false);
    setPdfPages(pages);
  };

  const handleMouseDown = (e: any, page: number) => {
    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      setIsDrawing(true);
      setStartPoint({ x: pos.x, y: pos.y });
    }
  };

  const handleMouseMove = (e: any, page: number) => {
    if (!isDrawing || !startPoint) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
      const newRect = {
        id: 'temp',
        x: startPoint.x,
        y: startPoint.y,
        width: pos.x - startPoint.x,
        height: pos.y - startPoint.y,
        page,
      };

      setRects((prev) => {
        const updated = [...prev];
        updated.pop();
        updated.push(newRect);
        return updated;
      });
    }
  };

  const handleMouseUp = (e: any, page: number) => {
    if (!isDrawing || !startPoint) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (pos) {
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

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  // const handleExport = async () => {
  //   setStartExport(true);

  //   // Tworzymy nowy dokument PDF
  //   const pdfDoc = await PDFDocument.create();
  //   // Ustal środek strony

  //   // Załaduj każdą stronę z oryginalnego PDF
  //   for (const [index, src] of pdfPages.entries()) {
  //     const pageWidth = src.width;
  //     const pageHeight = src.height;

  //     const centerX = pageWidth / 2;
  //     const centerY = pageHeight / 2;

  //     const page = pdfDoc.addPage([pageWidth, pageHeight]); // Dodajemy nową stronę o wymiarach 768x1024

  //     // Ustal wymiary obrazu na podstawie oryginalnego PDF
  //     const imageBytes = await fetch(src.src).then((res) => res.arrayBuffer());
  //     const image = await pdfDoc.embedPng(imageBytes);
  //     const { width, height } = image.scale(1);

  //     // Rysujemy obraz PDF na stronie, dostosowując jego położenie
  //     const scaleFactor = Math.min(pageWidth / width, pageHeight / height);
  //     const imgWidth = width * scaleFactor;
  //     const imgHeight = height * scaleFactor;

  //     const xOffset = centerX - imgWidth / 2; // Wyśrodkowanie obrazu
  //     const yOffset = centerY - imgHeight / 2; // Wyśrodkowanie obrazu

  //     page.drawImage(image, {
  //       x: xOffset,
  //       y: yOffset,
  //       width: image.width,
  //       height: image.height,
  //     });

  //     // Rysujemy prostokąty, skalując ich położenie i rozmiar
  //     const rectsOnPage = rects.filter((rect) => rect.page === index);
  //     for (const rect of rectsOnPage) {
  //       // Określanie wymarów prostokąta względem rozmiaru image
  //       const scaledX = xOffset + (rect.x / image.width) * imgWidth;
  //       const scaledY =
  //         yOffset + imgHeight - (rect.y / image.height) * imgHeight;
  //       const scaledWidth = (rect.width / image.width) * imgWidth;
  //       const scaledHeight = (rect.height / image.height) * imgHeight;

  //       // Rysowanie prostokąta zaktualizowanymi wartościami
  //       page.drawRectangle({
  //         x: scaledX,
  //         y: scaledY - scaledHeight,
  //         // width: rect.width,
  //         width: scaledWidth,
  //         // height: rect.height,
  //         height: scaledHeight,
  //         color: rgb(0, 0, 0), // Czarny kolor prostokąta
  //       });
  //     }
  //   }

  //   // Zapisz zanonimizowany PDF jako blob
  //   const pdfBytes = await pdfDoc.save();
  //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  //   // Utwórz link do pobrania
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${fileName}-anonymized.pdf`;
  //   setStartExport(false);
  //   a.click();
  //   URL.revokeObjectURL(url); // Zwolnij obiekt URL
  // };

  // const handleExport = async () => {
  //   setStartExport(true);
  //   const pdfDoc = await PDFDocument.create();

  //   for (let i = 0; i < pdfPages.length; i++) {
  //     const page = pdfPages[i];

  //     const canvas = document.createElement('canvas');
  //     const ctx = canvas.getContext('2d');
  //     canvas.width = page.width;
  //     canvas.height = page.height;

  //     const img = new Image();
  //     img.src = page.src;
  //     await new Promise((resolve) => (img.onload = resolve));

  //     ctx?.drawImage(img, 0, 0);

  //     rects.forEach((rect) => {
  //       if (rect.page === i) {
  //         ctx?.beginPath();
  //         ctx?.rect(rect.x, rect.y, rect.width, rect.height);
  //         ctx?.stroke();
  //       }
  //     });

  //     const webpDataUrl = canvas.toDataURL('image/webp');

  //     const imageData = webpDataUrl.replace(
  //       /^data:image\/(png|jpg|jpeg|webp);base64,/,
  //       ''
  //     );
  //     console.log('webpDataUrl: ', webpDataUrl);
  //     console.log('imageData: ', imageData);

  //     const pageImage = await pdfDoc.embedPng(imageData);
  //     const pdfPage = pdfDoc.addPage([page.width, page.height]);
  //     pdfPage.drawImage(pageImage, {
  //       x: 0,
  //       y: 0,
  //       width: page.width,
  //       height: page.height,
  //     });
  //   }

  //   const pdfBytes = await pdfDoc.save();

  //   const blob = new Blob([pdfBytes], { type: 'application/pdf' });

  //   // Utwórz link do pobrania
  //   const url = URL.createObjectURL(blob);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${fileName}-anonymized.pdf`;
  //   setStartExport(false);
  //   a.click();
  //   URL.revokeObjectURL(url); // Zwolnij obiekt URL
  // };

  // const handleExport = async () => {
  //   setStartExport(true);

  //   const pdfDoc = new jsPDF();

  //   for (const [index, src] of pdfPages.entries()) {
  //     const pageWidth = src.width;
  //     const pageHeight = src.height;

  //     // Dodaj nową stronę do dokumentu PDF
  //     if (index > 0) {
  //       pdfDoc.addPage();
  //     }

  //     // Załaduj obraz i dodaj go do PDF
  //     const img = new Image();
  //     img.src = src.src;

  //     await new Promise((resolve) => {
  //       img.onload = resolve; // Czekaj na załadowanie obrazu
  //     });

  //     // Rysuj obraz na stronie PDF
  //     pdfDoc.addImage(img, 'WEBP', 0, 0, pageWidth, pageHeight);

  //     // Rysuj prostokąty
  //     const rectsOnPage = rects.filter((rect) => rect.page === index);
  //     for (const rect of rectsOnPage) {
  //       const scaledX = (rect.x / img.width) * pageWidth; // Przelicz x
  //       const scaledY = (rect.y / img.height) * pageHeight; // Przelicz y
  //       const scaledWidth = (rect.width / img.width) * pageWidth; // Przelicz szerokość
  //       const scaledHeight = (rect.height / img.height) * pageHeight; // Przelicz wysokość

  //       pdfDoc.setDrawColor(0, 0, 0); // Ustal kolor prostokąta
  //       pdfDoc.rect(scaledX, scaledY, scaledWidth, scaledHeight); // Rysuj prostokąt
  //     }
  //   }

  //   // Zapisz zanonimizowany PDF jako blob
  //   const pdfBytes = pdfDoc.output('blob');

  //   // Utwórz link do pobrania
  //   const url = URL.createObjectURL(pdfBytes);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${fileName}-anonymized.pdf`;
  //   setStartExport(false);
  //   a.click();
  //   URL.revokeObjectURL(url); // Zwolnij obiekt URL
  // };

  // const handleExport = async () => {
  //   setStartExport(true);

  //   const pdfDoc = new jsPDF({
  //     unit: 'px',
  //     hotfixes: ['px_scaling'],
  //   });

  //   for (const [index, src] of pdfPages.entries()) {
  //     if (index > 0) {
  //       pdfDoc.addPage();
  //     }

  //     const img = new Image();
  //     img.src = src.src;

  //     await new Promise((resolve) => {
  //       img.onload = resolve;
  //     });

  //     // Get PDF page dimensions in points (72 DPI)
  //     const pdfPageWidth = pdfDoc.internal.pageSize.getWidth();
  //     const pdfPageHeight = pdfDoc.internal.pageSize.getHeight();

  //     // Calculate scaling to fit image within PDF page
  //     const scale = Math.min(
  //       pdfPageWidth / img.width,
  //       pdfPageHeight / img.height
  //     );

  //     const scaledWidth = img.width * scale;
  //     const scaledHeight = img.height * scale;

  //     // Center the image on the page
  //     const x = (pdfPageWidth - scaledWidth) / 2;
  //     const y = (pdfPageHeight - scaledHeight) / 2;

  //     // Add scaled image
  //     pdfDoc.addImage(img, 'WEBP', x, y, scaledWidth, scaledHeight);

  //     // Scale and draw rectangles
  //     const rectsOnPage = rects.filter((rect) => rect.page === index);
  //     for (const rect of rectsOnPage) {
  //       const scaledX = rect.x * scale + x;
  //       const scaledY = rect.y * scale + y;
  //       const scaledRectWidth = rect.width * scale;
  //       const scaledRectHeight = rect.height * scale;

  //       pdfDoc.setDrawColor(0, 0, 0);
  //       pdfDoc.rect(scaledX, scaledY, scaledRectWidth, scaledRectHeight, 'F');
  //     }
  //   }

  //   const pdfBytes = pdfDoc.output('blob');
  //   const url = URL.createObjectURL(pdfBytes);
  //   const a = document.createElement('a');
  //   a.href = url;
  //   a.download = `${fileName}-anonymized.pdf`;
  //   setStartExport(false);
  //   a.click();
  //   URL.revokeObjectURL(url);
  // };

  const handleExport = async () => {
    setStartExport(true);

    // Ustaw rozdzielczość PDF na 300 DPI
    const dpi = 300;
    const inchToPt = 72; // 1 cal = 72 punkty w jsPDF
    const scaleFactor = dpi / inchToPt; // Skalowanie dla DPI

    // Tworzymy nowy dokument PDF
    const pdfDoc = new jsPDF({
      unit: 'px', // używamy pikseli dla lepszego dopasowania
      hotfixes: ['px_scaling'],
    });

    for (const [index, src] of pdfPages.entries()) {
      if (index > 0) {
        pdfDoc.addPage();
      }

      const img = new Image();
      img.src = src.src;

      await new Promise((resolve) => {
        img.onload = resolve;
      });

      // Pobieramy szerokość i wysokość strony w punktach (1 cal = 72 punkty)
      const pdfPageWidth = pdfDoc.internal.pageSize.getWidth();
      const pdfPageHeight = pdfDoc.internal.pageSize.getHeight();

      // Skalowanie obrazu z uwzględnieniem DPI (przekształcamy wymiary do punktów)
      const imgWidthInInches = img.width / dpi;
      const imgHeightInInches = img.height / dpi;

      const scaledWidth = imgWidthInInches * inchToPt;
      const scaledHeight = imgHeightInInches * inchToPt;

      // Skalowanie tak, aby obraz pasował do strony PDF
      const scale = Math.min(
        pdfPageWidth / scaledWidth,
        pdfPageHeight / scaledHeight
      );

      const finalWidth = scaledWidth * scale;
      const finalHeight = scaledHeight * scale;

      // Centrowanie obrazu na stronie
      const x = (pdfPageWidth - finalWidth) / 2;
      const y = (pdfPageHeight - finalHeight) / 2;

      // Dodaj obraz w odpowiedniej rozdzielczości
      pdfDoc.addImage(img, 'WEBP', x, y, finalWidth, finalHeight);

      // Rysowanie prostokątów (przeskalowane)
      const rectsOnPage = rects.filter((rect) => rect.page === index);
      for (const rect of rectsOnPage) {
        const scaledX = rect.x * scale + x;
        const scaledY = rect.y * scale + y;
        const scaledRectWidth = rect.width * scale;
        const scaledRectHeight = rect.height * scale;

        pdfDoc.setDrawColor(0, 0, 0);
        pdfDoc.rect(scaledX, scaledY, scaledRectWidth, scaledRectHeight, 'F');
      }
    }

    // Zapisujemy zanonimizowany PDF jako blob
    const pdfBytes = pdfDoc.output('blob');
    const url = URL.createObjectURL(pdfBytes);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-anonymized.pdf`;
    setStartExport(false);
    a.click();
    URL.revokeObjectURL(url); // Zwolnij obiekt URL
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

  // Renderowanie stron PDF
  const renderedPages = useMemo(() => {
    return pdfPages.map((page, index) => (
      <PdfPageImage
        key={index}
        src={page.src} // Każda strona ma unikalny obraz
        width={page.width}
        height={page.height}
      />
    ));
  }, [pdfPages]);

  return (
    <div>
      <Container className="bg-light">
        <Row>
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
                onMouseDown={(e) => handleMouseDown(e, index)}
                onMouseMove={(e) => handleMouseMove(e, index)}
                onMouseUp={(e) => handleMouseUp(e, index)}
                style={{ border: '1px solid black' }}
              >
                <Layer className="border">
                  <PdfPageImage
                    src={page.src}
                    width={page.width}
                    height={page.height}
                  />
                  {/* <KonvaImage
                    image={image}
                    x={0}
                    y={0}
                    width={pdfPages[index]?.width}
                    height={pdfPages[index]?.height}
                  /> */}
                  {/* {pdfPages.map((page, index) => (
                    <PdfPageImage
                      key={index}
                      src={page.src} // Każda strona ma swoje źródło obrazu
                      width={page.width}
                      height={page.height}
                    />
                  ))} */}
                  {/* {renderedPages} */}
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

// const PdfPageImage: React.FC<{
//   src: string;
//   width: number;
//   height: number;
// }> = ({ src, width, height }) => {
//   const [image] = useImage(src);
//   return (
//     <KonvaImage
//       image={image}
//       x={0}
//       y={0}
//       width={width}
//       height={height}
//       stroke={'black'}
//       strokeEnabled
//       strokeHitEnabled
//     />
//   );
// };

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
