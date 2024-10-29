// const loadPdf = async (pdfData: Uint8Array) => {
//   setLoading(true);

//   const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
//   // const pages: string[] = [];
//   const pages: { src: string; width: number; height: number }[] = [];
//   // const scale = 2.0;

//   for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
//     const page = await pdf.getPage(pageNum);

//     const viewport = page.getViewport({ scale: 1 });
//     const scale = 1;
//     const canvas = document.createElement('canvas');
//     const context = canvas.getContext('2d');
//     if (context) {
//       canvas.height = viewport.height * scale;
//       canvas.width = viewport.width * scale;
//       context.scale(scale, scale);
//       await page.render({ canvasContext: context, viewport }).promise;
//       pages.push({
//         src: canvas.toDataURL('image/png'),
//         width: viewport.width,
//         height: viewport.height,
//       });
//     }
//   }
//   setLoading(false);
//   setPdfPages(pages);
// };
