import { Router } from 'express';
import multer from 'multer';
import type { ExtractEssayText } from '../../../application/use-cases/extract-essay-text.js';

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png']);

export function createOcrRouter(useCase: ExtractEssayText, maxUploadMb: number) {
  const router = Router();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: maxUploadMb * 1024 * 1024, files: 5 },
    fileFilter: (_request, file, callback) => {
      callback(null, ALLOWED_MIME_TYPES.has(file.mimetype));
    },
  });

  router.post('/', upload.array('documents', 5), async (request, response, next) => {
    try {
      const files = (request.files as Express.Multer.File[] | undefined) ?? [];
      if (files.length === 0) throw new Error('Envie um arquivo PNG ou JPG.');
      const result = await useCase.execute(files.map((file) => ({
        data: file.buffer,
        mimeType: file.mimetype,
        filename: file.originalname,
      })));
      response.json(result);
    } catch (error) {
      next(error);
    }
  });
  return router;
}
