import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { env } from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadDir = path.resolve(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer disk storage with sanitized unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 40);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  }
});

const maxBytes = env.MAX_FILE_SIZE_MB * 1024 * 1024;

// Image upload filter (JPG, JPEG, PNG)
const imageFilter = (req, file, cb) => {
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionAllowed = allowedExtensions.includes(ext);
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype) || (file.mimetype && file.mimetype.startsWith('image/'));

  if (isExtensionAllowed || isMimeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid image file format. Supported formats are JPG, JPEG, and PNG.'), false);
  }
};

// Audio upload filter (WEBM, WAV, MP3, OGG, M4A)
const audioFilter = (req, file, cb) => {
  const allowedExtensions = ['.webm', '.wav', '.mp3', '.ogg', '.m4a'];
  const allowedMimes = [
    'audio/webm',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/mpeg',
    'audio/mp3',
    'audio/ogg',
    'audio/x-m4a',
    'audio/mp4'
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isExtensionAllowed = allowedExtensions.includes(ext);
  const isMimeAllowed = allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/');

  if (isExtensionAllowed || isMimeAllowed) {
    cb(null, true);
  } else {
    cb(new Error('Invalid audio file format. Supported formats are WEBM, WAV, MP3, and OGG.'), false);
  }
};

export const uploadImage = multer({
  storage,
  limits: { fileSize: maxBytes },
  fileFilter: imageFilter
});

export const uploadAudio = multer({
  storage,
  limits: { fileSize: maxBytes },
  fileFilter: audioFilter
});
