import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { Readable } from 'stream';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadSignature = async (buffer, companyId, deliveryNoteId) => {
  try {
    const optimized = await sharp(buffer)
      .resize(800, 300, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `bildyapp/${companyId}/signatures`,
          public_id: `signature_${deliveryNoteId}`,
          overwrite: true,
          resource_type: 'image'
        },
        (error, result) => {
          if (error) reject(error);
          else resolve({ url: result.secure_url, publicId: result.public_id });
        }
      );

      const readableStream = Readable.from(optimized);
      readableStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error subiendo firma:', error);
    throw error;
  }
};

export const uploadPDF = async (buffer, companyId, deliveryNoteId) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `bildyapp/${companyId}/pdfs`,
        public_id: `deliverynote_${deliveryNoteId}`,
        overwrite: true,
        resource_type: 'raw'
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );

    const readableStream = Readable.from(buffer);
    readableStream.pipe(uploadStream);
  });
};