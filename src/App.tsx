import React, { useRef, useState } from 'react';
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
import { Button, Container, Form, Row } from 'react-bootstrap';
import { PDFDocument, rgb } from 'pdf-lib';
import LoadingSpinner from './componenst/LoadingSpinner';

interface RectProps {
  id: string; // Zmiana na 'string'
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const App: React.FC = () => {
  const [pdfPages, setPdfPages] = useState<string[]>([]);
  const [rects, setRects] = useState<RectProps[]>([]);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const typedArray = new Uint8Array(ev.target.result as ArrayBuffer);
          await loadPdf(typedArray);
        }
      };
      setFileName(file.name);
      reader.readAsArrayBuffer(file);
    } else {
      alert('Wybrany plik nie jest plikiem PDF.');
    }
  };

  const loadPdf = async (pdfData: Uint8Array) => {
    setLoading(true);
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const pages: string[] = [];
    const scale = 1.0;

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        pages.push(canvas.toDataURL());
      }
    }
    setLoading(false);
    setPdfPages(pages);
  };

  const handleMouseDown = (e: any, page: number) => {
    console.log('handleMouseDown page: ', page);
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
    }

    setIsDrawing(false);
    setStartPoint(null);
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
  };

  const handleExport = async () => {
    setStartExport(true);

    // Tworzymy nowy dokument PDF
    const pdfDoc = await PDFDocument.create();

    // Ustal wymiary stron PDF
    const pageWidth = 768;
    const pageHeight = 1024;

    // Załaduj każdą stronę z oryginalnego PDF
    for (const [index, src] of pdfPages.entries()) {
      const page = pdfDoc.addPage([pageWidth, pageHeight]); // Dodajemy nową stronę o wymiarach 1024x768

      // Ustal wymiary obrazu na podstawie oryginalnego PDF
      const imageBytes = await fetch(src).then((res) => res.arrayBuffer());
      const image = await pdfDoc.embedPng(imageBytes);
      const { width, height } = image.scale(1);

      // Rysujemy obraz PDF na stronie, dostosowując jego położenie
      const scaleFactor = Math.min(pageWidth / width, pageHeight / height);
      const imgWidth = width * scaleFactor;
      const imgHeight = height * scaleFactor;

      const xOffset = (pageWidth - imgWidth) / 2; // Wyśrodkowanie obrazu
      const yOffset = (pageHeight - imgHeight) / 2; // Wyśrodkowanie obrazu

      page.drawImage(image, {
        x: xOffset,
        y: yOffset,
        width: imgWidth,
        height: imgHeight,
      });

      // Rysujemy prostokąty,
      // const rectsOnPage = rects.filter((rect) => rect.page === index);
      // for (const rect of rectsOnPage) {
      //   // Skalowanie pozycji prostokątów do rozmiarów strony
      //   // const scaledX = imgWidth - rect.width - rect.x;
      //   const scaledX = rect.x;
      //   const scaledY = imgHeight - rect.y - rect.height;
      //   const scaledWidth = rect.width * scaleFactor;
      //   const scaledHeight = rect.height * scaleFactor;
      //   // Dostosowujemy położenie prostokątów
      //   // page.drawRectangle({
      //   //   x: rect.x, // Dostosowanie położenia
      //   //   y: pageHeight - rect.y - rect.height,
      //   //   width: rect.width,
      //   //   height: rect.height,
      //   //   color: rgb(0, 0, 0), // Czarny kolor prostokąta
      //   // });
      //   page.drawRectangle({
      //     x: scaledX,
      //     y: scaledY,
      //     width: rect.width,
      //     height: rect.height,
      //     color: rgb(0, 0, 0), // Czarny kolor prostokąta
      //   });
      // }
      const rectsOnPage = rects.filter((rect) => rect.page === index);
      for (const rect of rectsOnPage) {
        // Skalowanie pozycji i rozmiaru prostokąta zgodnie ze skalą obrazu
        const scaledX = rect.x;
        const scaledY = pageHeight - rect.y - rect.height;
        const scaledWidth = rect.width;
        const scaledHeight = rect.height;

        // Rysowanie prostokąta zaktualizowanymi wartościami
        page.drawRectangle({
          x: scaledX,
          y: scaledY,
          width: scaledWidth,
          height: scaledHeight,
          color: rgb(0, 0, 0), // Czarny kolor prostokąta
        });
      }
    }

    // Zapisz zanonimizowany PDF jako blob
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Utwórz link do pobrania
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}-anonymized.pdf`;
    setStartExport(false);
    a.click();
    URL.revokeObjectURL(url); // Zwolnij obiekt URL
  };

  if (loading) return <LoadingSpinner message="Ładowanie pliku PDF..." />;
  if (startExport)
    return <LoadingSpinner message="Przygotowywanie pliku PDF..." />;

  return (
    <Container>
      <Row className="my-3">
        <h1>Anonimizacja PDF</h1>
        <Form.Control
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
          className="my-3"
        />
        {pdfPages.map((src, index) => (
          <Stage
            key={index}
            width={768}
            height={1024}
            // ref={(el) => (stageRefs.current[index] = el)}
            // onClick={(e) => handleStageClick(e, index)}
            onMouseDown={(e) => handleMouseDown(e, index)}
            onMouseMove={(e) => handleMouseMove(e, index)}
            onMouseUp={(e) => handleMouseUp(e, index)}
            className="border"
          >
            <Layer className="border">
              <PdfPageImage src={src} />
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
        ))}
        <Button onClick={handleExport} className="my-3">
          Exportuj PDF
        </Button>
      </Row>
    </Container>
  );
};

const PdfPageImage: React.FC<{ src: string }> = ({ src }) => {
  const [image] = useImage(src);
  return <KonvaImage image={image} x={0} y={0} width={768} height={1024} />;
};

export default App;
