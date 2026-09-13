import type { ErrorRequestHandler } from 'express';
import { MulterError } from 'multer';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next;
  if (error instanceof MulterError) {
    response.status(400).json({ error: 'Falha no upload.', details: error.message });
    return;
  }
  if (error instanceof ZodError) {
    response.status(422).json({ error: 'Resposta ou entrada inválida.', details: error.issues[0]?.message });
    return;
  }
  const message = error instanceof Error ? error.message : 'Erro interno inesperado.';
  const isClientError = /Envie|curto|formato|arquivo/i.test(message);
  response.status(isClientError ? 400 : 502).json({ error: message });
};
