/**
 * Compresses an image from a Data URL (Base64) or File to a smaller Base64 string.
 * @param source Data URL or File
 * @param maxWidth Max width in pixels
 * @param maxHeight Max height in pixels
 * @param quality Compression quality (0 to 1)
 * @returns Promise<string> Compressed Data URL
 */
export const compressImage = async (
  source: string | File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.7,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const compressed = canvas.toDataURL("image/jpeg", quality);
      resolve(compressed);
    };

    img.onerror = (err) => reject(err);

    if (source instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(source);
    } else {
      img.src = source;
    }
  });
};
