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

// const handleExport = async () => {
//   setStartExport(true);

//   // Ustaw rozdzielczość PDF na 300 DPI
//   const dpi = 300;
//   const inchToPt = 72; // 1 cal = 72 punkty w jsPDF
//   const scaleFactor = dpi / inchToPt; // Skalowanie dla DPI

//   // Tworzymy nowy dokument PDF
//   const pdfDoc = new jsPDF({
//     unit: 'px', // używamy pikseli dla lepszego dopasowania
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

//     // Pobieramy szerokość i wysokość strony w punktach (1 cal = 72 punkty)
//     const pdfPageWidth = pdfDoc.internal.pageSize.getWidth();
//     const pdfPageHeight = pdfDoc.internal.pageSize.getHeight();

//     // Skalowanie obrazu z uwzględnieniem DPI (przekształcamy wymiary do punktów)
//     const imgWidthInInches = img.width / dpi;
//     const imgHeightInInches = img.height / dpi;

//     const scaledWidth = imgWidthInInches * inchToPt;
//     const scaledHeight = imgHeightInInches * inchToPt;

//     // Skalowanie tak, aby obraz pasował do strony PDF
//     const scale = Math.min(
//       pdfPageWidth / scaledWidth,
//       pdfPageHeight / scaledHeight
//     );

//     const finalWidth = scaledWidth * scale;
//     const finalHeight = scaledHeight * scale;

//     // Centrowanie obrazu na stronie
//     const x = (pdfPageWidth - finalWidth) / 2;
//     const y = (pdfPageHeight - finalHeight) / 2;

//     // Dodaj obraz w odpowiedniej rozdzielczości
//     pdfDoc.addImage(img, 'WEBP', x, y, finalWidth, finalHeight);

//     // Rysowanie prostokątów (przeskalowane)
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

//   // Zapisujemy zanonimizowany PDF jako blob
//   const pdfBytes = pdfDoc.output('blob');
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

//   const dpi = 300;
//   const inchToPt = 72;
//   const scaleFactor = dpi / inchToPt;

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

//     const pdfPageWidth = pdfDoc.internal.pageSize.getWidth();
//     const pdfPageHeight = pdfDoc.internal.pageSize.getHeight();

//     const imgWidthInInches = img.width / dpi;
//     const imgHeightInInches = img.height / dpi;

//     const scaledWidth = imgWidthInInches * inchToPt;
//     const scaledHeight = imgHeightInInches * inchToPt;

//     const scale = Math.min(
//       pdfPageWidth / scaledWidth,
//       pdfPageHeight / scaledHeight
//     );

//     const finalWidth = scaledWidth * scale;
//     const finalHeight = scaledHeight * scale;

//     const x = (pdfPageWidth - finalWidth) / 2;
//     const y = (pdfPageHeight - finalHeight) / 2;

//     pdfDoc.addImage(img, 'WEBP', x, y, finalWidth, finalHeight);

//     // Improved rectangle scaling and positioning
//     const rectsOnPage = rects.filter((rect) => rect.page === index);
//     for (const rect of rectsOnPage) {
//       // Calculate relative position of rectangle on original image
//       const relativeX = rect.x / img.width;
//       const relativeY = rect.y / img.height;
//       const relativeWidth = rect.width / img.width;
//       const relativeHeight = rect.height / img.height;

//       // Apply these relative positions to the scaled image
//       const scaledX = x + relativeX * finalWidth;
//       const scaledY = y + relativeY * finalHeight;
//       const scaledRectWidth = relativeWidth * finalWidth;
//       const scaledRectHeight = relativeHeight * finalHeight;

//       pdfDoc.setFillColor(0, 0, 0);
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

// const handleExport = async () => {
//   setStartExport(true);

//   // Increase DPI for better quality
//   const dpi = 600; // Doubled from 300 to 600
//   const inchToPt = 72;
//   const scaleFactor = dpi / inchToPt;

//   const pdfDoc = new jsPDF({
//     unit: 'px',
//     hotfixes: ['px_scaling'],
//     compress: false, // Disable compression for better quality
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

//     const pdfPageWidth = pdfDoc.internal.pageSize.getWidth();
//     const pdfPageHeight = pdfDoc.internal.pageSize.getHeight();

//     // Calculate dimensions preserving original aspect ratio
//     const aspectRatio = img.width / img.height;
//     const finalWidth = pdfPageWidth;
//     const finalHeight = pdfPageWidth / aspectRatio;

//     const x = 0;
//     const y = (pdfPageHeight - finalHeight) / 2;

//     // Add image with quality settings
//     pdfDoc.addImage(
//       img,
//       'WEBP',
//       x,
//       y,
//       finalWidth,
//       finalHeight,
//       undefined,
//       'FAST',
//       0
//     );

//     const rectsOnPage = rects.filter((rect) => rect.page === index);
//     for (const rect of rectsOnPage) {
//       const relativeX = rect.x / img.width;
//       const relativeY = rect.y / img.height;
//       const relativeWidth = rect.width / img.width;
//       const relativeHeight = rect.height / img.height;

//       const scaledX = x + relativeX * finalWidth;
//       const scaledY = y + relativeY * finalHeight;
//       const scaledRectWidth = relativeWidth * finalWidth;
//       const scaledRectHeight = relativeHeight * finalHeight;

//       pdfDoc.setFillColor(0, 0, 0);
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

// const handleExport = async () => {
//   setStartExport(true);

//   const dpi = 600;
//   const inchToPt = 72;
//   const scaleFactor = dpi / inchToPt;

//   const pdfDoc = new jsPDF({
//     unit: 'px',
//     hotfixes: ['px_scaling'],
//     compress: false,
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

//     const pdfPageWidth = pdfDoc.internal.pageSize.getWidth() * scaleFactor;
//     const pdfPageHeight = pdfDoc.internal.pageSize.getHeight() * scaleFactor;

//     const aspectRatio = img.width / img.height;
//     const finalWidth = pdfPageWidth;
//     const finalHeight = pdfPageWidth / aspectRatio;

//     const x = 0;
//     const y = (pdfPageHeight - finalHeight) / 2;

//     // Apply scaleFactor to image rendering
//     pdfDoc.addImage(
//       img,
//       'WEBP',
//       x / scaleFactor,
//       y / scaleFactor,
//       finalWidth / scaleFactor,
//       finalHeight / scaleFactor,
//       undefined,
//       'FAST',
//       0
//     );

//     const rectsOnPage = rects.filter((rect) => rect.page === index);
//     for (const rect of rectsOnPage) {
//       const relativeX = rect.x / img.width;
//       const relativeY = rect.y / img.height;
//       const relativeWidth = rect.width / img.width;
//       const relativeHeight = rect.height / img.height;

//       // Apply scaleFactor to rectangle positioning and dimensions
//       const scaledX = (x + relativeX * finalWidth) / scaleFactor;
//       const scaledY = (y + relativeY * finalHeight) / scaleFactor;
//       const scaledRectWidth = (relativeWidth * finalWidth) / scaleFactor;
//       const scaledRectHeight = (relativeHeight * finalHeight) / scaleFactor;

//       pdfDoc.setFillColor(0, 0, 0);
//       pdfDoc.rect(scaledX, scaledY, scaledRectWidth, scaledRectHeight, 'F');
//     }
//   }

//   const pdfBytes = pdfDoc.output('blob', { compress: false });
//   const url = URL.createObjectURL(pdfBytes);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = `${fileName}-anonymized.pdf`;
//   setStartExport(false);
//   a.click();
//   URL.revokeObjectURL(url);
// };

// const handleExport = async () => {
//   setStartExport(true);

//   const dpi = 600;
//   const inchToPt = 72;

//   const pdfDoc = new jsPDF({
//     unit: 'px',
//     hotfixes: ['px_scaling'],
//     compress: false,
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

//     const pdfPageWidth = pdfDoc.internal.pageSize.getWidth();
//     const pdfPageHeight = pdfDoc.internal.pageSize.getHeight();

//     // Calculate image scaling
//     const scale = Math.min(
//       pdfPageWidth / img.width,
//       pdfPageHeight / img.height
//     );

//     const finalWidth = img.width * scale;
//     const finalHeight = img.height * scale;

//     // Center image on page
//     const x = (pdfPageWidth - finalWidth) / 2;
//     const y = (pdfPageHeight - finalHeight) / 2;

//     // Add image with proper positioning
//     pdfDoc.addImage(
//       img,
//       'WEBP',
//       x,
//       y,
//       finalWidth,
//       finalHeight,
//       undefined,
//       'FAST'
//     );

//     // Draw rectangles with corrected scaling
//     const rectsOnPage = rects.filter((rect) => rect.page === index);
//     for (const rect of rectsOnPage) {
//       // Calculate relative positions as percentages
//       const relativeX = rect.x / img.width;
//       const relativeY = rect.y / img.height;
//       const relativeWidth = rect.width / img.width;
//       const relativeHeight = rect.height / img.height;

//       // Apply scaling to maintain proportions
//       const scaledX = x + relativeX * finalWidth;
//       const scaledY = y + relativeY * finalHeight;
//       const scaledRectWidth = relativeWidth * finalWidth;
//       const scaledRectHeight = relativeHeight * finalHeight;

//       pdfDoc.setFillColor(0, 0, 0);
//       pdfDoc.rect(scaledX, scaledY, scaledRectWidth, scaledRectHeight, 'F');
//     }
//   }

//   const pdfBytes = pdfDoc.output('arraybuffer');
//   const blob = new Blob([pdfBytes], { type: 'application/pdf' });
//   const url = URL.createObjectURL(blob);
//   const a = document.createElement('a');
//   a.href = url;
//   a.download = `${fileName}-anonymized.pdf`;
//   setStartExport(false);
//   a.click();
//   URL.revokeObjectURL(url);
// };
