// const convertToWebP = async (imageDataUrl: string) => {
//   return new Promise((resolve) => {
//     const img = new Image();
//     img.src = imageDataUrl;
//     img.onload = () => {
//       const canvas = document.createElement('canvas');
//       const ctx = canvas.getContext('2d')!;
//       canvas.width = img.width;
//       canvas.height = img.height;
//       ctx.drawImage(img, 0, 0);

//       const webpDataUrl = canvas.toDataURL('image/webp', 1.0);
//       resolve(webpDataUrl);
//     };
//   });
// };
