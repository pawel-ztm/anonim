import React, { useRef, useState, useEffect } from 'react';
import {
  Stage,
  Layer,
  Rect,
  Transformer,
  Image as KonvaImage,
} from 'react-konva';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import { Button, Container } from 'react-bootstrap';
import { PDFDocument, rgb } from 'pdf-lib';
import './App.css';

interface RectProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const App2: React.FC = () => {
  const [pdfPages, setPdfPages] = useState<
    { src: string; width: number; height: number }[]
  >([]);
  const [rects, setRects] = useState<RectProps[]>([]);
  const [originalPdfData, setOriginalPdfData] = useState<Uint8Array | null>(
    null
  );
  const [fileName, setFileName] = useState<string>('');
  const stageRef = useRef<any>(null);

  // Preload images for all pages to avoid hook issues
  const [pageImages, setPageImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      const images: HTMLImageElement[] = pdfPages.map((page) => {
        const img = new Image();
        img.src = page.src;
        return img;
      });
      setPageImages(images);
    };
    if (pdfPages.length > 0) loadImages();
  }, [pdfPages]);

  const loadPdf = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      const pdfData = new Uint8Array(arrayBuffer);
      setOriginalPdfData(pdfData);

      const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
      const pages: { src: string; width: number; height: number }[] = [];

      for (let i = 0; i < pdf.numPages; i++) {
        const page = await pdf.getPage(i + 1);
        const scale = 2.0; // Increase scale for higher resolution
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: context!, viewport }).promise;
        pages.push({
          src: canvas.toDataURL(),
          width: viewport.width,
          height: viewport.height,
        });
      }
      setPdfPages(pages);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleExportPDF = async () => {
    if (!originalPdfData || !stageRef.current) return;

    const pdfDoc = await PDFDocument.load(originalPdfData);
    const pages = pdfDoc.getPages();

    for (const rect of rects) {
      const page = pages[rect.page];
      page.drawRectangle({
        x: rect.x,
        y: page.getHeight() - rect.y - rect.height,
        width: rect.width,
        height: rect.height,
        color: rgb(0, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || 'annotated'}.pdf`;
    link.click();
  };

  const handleExportPNG = () => {
    if (!stageRef.current) return;

    const dataURL = stageRef.current.toDataURL({
      mimeType: 'image/png',
      pixelRatio: 2,
    });
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `${fileName || 'annotated'}.png`;
    link.click();
  };

  return (
    <Container>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => e.target.files && loadPdf(e.target.files[0])}
      />

      <Stage
        width={window.innerWidth}
        height={window.innerHeight}
        ref={stageRef}
      >
        <Layer>
          {pageImages.map((img, i) => (
            <KonvaImage key={i} image={img} x={0} y={i * pdfPages[i].height} />
          ))}
          {rects.map((rect) => (
            <Rect key={rect.id} {...rect} fill="black" opacity={0.5} />
          ))}
        </Layer>
      </Stage>

      <Button onClick={handleExportPDF}>Export as PDF</Button>
      <Button onClick={handleExportPNG}>Export as PNG</Button>
    </Container>
  );
};

export default App2;
