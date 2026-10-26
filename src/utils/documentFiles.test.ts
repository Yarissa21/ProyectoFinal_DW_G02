import { describe, expect, it } from 'vitest';
import { isAllowedDocument } from './documentFiles';

function crearArchivo(nombre: string, tipo: string): File {
  return new File(['contenido del documento'], nombre, { type: tipo });
}

describe('Archivos permitidos para el expediente', () => {
  it('acepta PDF, imágenes y documentos de Word', () => {
    expect(isAllowedDocument(crearArchivo('antecedentes-penales.pdf', 'application/pdf'))).toBe(true);
    expect(isAllowedDocument(crearArchivo('foto-dpi.jpg', 'image/jpeg'))).toBe(true);
    expect(
      isAllowedDocument(
        crearArchivo(
          'contrato-firmado.docx',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ),
      ),
    ).toBe(true);
  });

  it('rechaza programas y archivos comprimidos', () => {
    expect(isAllowedDocument(crearArchivo('instalador.exe', 'application/x-msdownload'))).toBe(false);
    expect(isAllowedDocument(crearArchivo('documentos.zip', 'application/zip'))).toBe(false);
  });
});