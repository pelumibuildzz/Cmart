import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
});

export const uploadImage = async (
  file: File,
  fileName: string,
  folder: string = 'products'
) => {
  try {
    // Convert File to base64
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');

    const result = await imagekit.upload({
      file: base64,
      fileName,
      folder,
    });

    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (
  files: File[],
  folder: string = 'products'
) => {
  const uploadPromises = files.map((file) => {
    const fileName = `${Date.now()}-${file.name}`;
    return uploadImage(file, fileName, folder);
  });

  return Promise.all(uploadPromises);
};

export const deleteImage = async (fileId: string): Promise<void> => {
  try {
    await imagekit.deleteFile(fileId);
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

export const getImageUrl = (path: string, options: any = {}) => {
  return imagekit.url({
    path,
    transformation: [{ quality: 'auto' }, ...options],
  });
}; 