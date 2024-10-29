// const handleExportAllToPNG = async () => {
//   if (!stageRef.current) return;

//   for (let index = 0; index < pdfPages.length; index++) {
//     // Ustaw pozycję widoku na bieżącą stronę
//     stageRef.current.position({ x: 0, y: -index * pdfPages[index].height });
//     stageRef.current.batchDraw();

//     // Upewnij się, że zmiana pozycji jest odświeżona przed wykonaniem zrzutu
//     await new Promise((resolve) => requestAnimationFrame(resolve));

//     // Generowanie pliku PNG
//     const dataURL = stageRef.current.toDataURL({
//       mimeType: 'image/png',
//       pixelRatio: 2,
//     });

//     // Tworzenie i pobranie pliku PNG
//     const link = document.createElement('a');
//     link.href = dataURL;
//     link.download = `${fileName || 'annotated'}_page_${index + 1}.png`;
//     link.click();
//   }

//   // Przywrócenie pozycji sceny po zakończeniu eksportu
//   stageRef.current.position({ x: 0, y: 0 });
//   stageRef.current.batchDraw();
// };
