const MAX_EDGE = 1200;
const JPEG_QUALITY = 0.8;

/** Shrinks an image file so its longest edge is at most 1200px and returns it as a JPEG data URL. Rejects if the file can't be read as an image. */
export async function resizeImage(file: File): Promise<string> {
  // Rejects for files that are not images the browser can decode.
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const context = canvas.getContext('2d');
    if (!context) throw new Error('Canvas is not available');
    // JPEG has no transparency, so transparent PNGs would turn black without a white backdrop.
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL('image/jpeg', JPEG_QUALITY);
  } finally {
    bitmap.close();
  }
}
