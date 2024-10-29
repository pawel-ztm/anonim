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

// const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const file = e.target.files?.[0];
//   if (file && file.type === 'application/pdf') {
//     const reader = new FileReader();
//     reader.onload = async (ev) => {
//       if (ev.target?.result) {
//         const typedArray = new Uint8Array(ev.target.result as ArrayBuffer);
//         const pdfDoc = await pdfjsLib.getDocument({ data: typedArray })
//           .promise;

//         const numPages = pdfDoc.numPages;
//         const pages: { src: string; width: number; height: number }[] = [];

//         for (let i = 1; i <= numPages; i++) {
//           const page = await pdfDoc.getPage(i);
//           const viewport = page.getViewport({ scale: 1 });
//           const canvas = document.createElement('canvas');
//           const context = canvas.getContext('2d')!;
//           canvas.width = viewport.width;
//           canvas.height = viewport.height;

//           await page.render({ canvasContext: context, viewport }).promise;

//           // Konwersja obrazu canvas na WebP
//           const webpImage = await convertToWebP(canvas.toDataURL());

//           pages.push({
//             src: webpImage as string,
//             width: canvas.width,
//             height: canvas.height,
//           });
//         }

//         setPdfPages(pages);
//       }
//     };
//     reader.readAsArrayBuffer(file);
//   }
// };
