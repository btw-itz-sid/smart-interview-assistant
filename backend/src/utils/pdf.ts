import { logger } from './logger';

// pdf-parse v1 exports a function; v2 exports a PDFParse class.
export const extractPdfText = async (buffer: Buffer): Promise<string> => {
  const mod = require('pdf-parse');

  if (typeof mod?.PDFParse === 'function') {
    const parser = new mod.PDFParse({ data: buffer });
    try {
      const result = await parser.getText();
      return (result?.text || '').trim();
    } finally {
      if (typeof parser.destroy === 'function') {
        await parser.destroy();
      }
    }
  }

  const parseFn = typeof mod === 'function' ? mod : mod?.default;
  if (typeof parseFn === 'function') {
    const result = await parseFn(buffer);
    return (result?.text || '').trim();
  }

  logger.error('pdf-parse export shape is not supported');
  throw new Error('PDF parser is unavailable');
};
