import React, { useEffect, useRef, useState } from 'react';
import { Stage, Layer, Rect, Image } from 'react-konva';
import * as pdfjsLib from 'pdfjs-dist';
import 'pdfjs-dist/legacy/build/pdf.worker.mjs';
import { PDFDocument, rgb } from 'pdf-lib';
import Konva from 'konva';

interface RectProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
}

const App2: React.FC = () => {
  const [pdfPages, setPdfPages] = useState<HTMLImageElement[]>([]);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);
  const [rects, setRects] = useState<RectProps[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const stageRef = useRef<Konva.Stage>(null);
  const layerRef = useRef<Konva.Layer>(null);

  const containerSize = {
    width: 768,
    height: 1024,
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(err);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        if (ev.target?.result) {
          const typedArray = new Uint8Array(ev.target.result as ArrayBuffer);
          setPdfData(typedArray);
          await loadPdf(typedArray);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert('Please select a PDF file.');
    }
  };

  const loadPdf = async (pdfData: Uint8Array) => {
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
    const scale = 1.0;
    const pages: HTMLImageElement[] = [];
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (context) {
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        const img = await loadImage(canvas.toDataURL());
        pages.push(img);
      }
    }
    setPdfPages(pages);
  };

  const handleExportPdf = async () => {
    if (!pdfData) return;
    // Eksport PDF...
  };

  const handleMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Funkcja do rozpoczęcia rysowania...
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    // Funkcja do rysowania prostokątów...
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} accept="application/pdf" />
      <button onClick={handleExportPdf}>Export PDF</button>
      <Stage
        width={containerSize.width}
        height={containerSize.height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        ref={stageRef}
      >
        <Layer ref={layerRef}>
          {pdfPages.map((page, i) => (
            <Image key={i} image={page} x={0} y={0} />
          ))}
          {rects.map((rect) => (
            <Rect
              key={rect.id}
              x={rect.x}
              y={rect.y}
              width={rect.width}
              height={rect.height}
              fill="black"
              opacity={0.5}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default App2;
