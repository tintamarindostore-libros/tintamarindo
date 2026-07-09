import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib'

const TEXTO_MARCA_AGUA = 'TINTAMARINDO · MUESTRA'

// Marca de agua solo en las páginas interiores ilustradas — asume que el PDF sube
// en el orden físico del libro (tapa, retiración de tapa, interior, retiración de
// contratapa, contratapa), así que se salta las primeras y últimas 2 páginas.
export async function generarPdfConMarcaDeAgua(bytes: Buffer): Promise<Buffer> {
  const pdfDoc = await PDFDocument.load(bytes)
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const paginas = pdfDoc.getPages()

  const desde = Math.min(2, paginas.length)
  const hasta = Math.max(paginas.length - 2, desde)

  for (let i = desde; i < hasta; i++) {
    const pagina = paginas[i]
    const { width, height } = pagina.getSize()
    const tamanoTexto = 22
    const anchoTexto = font.widthOfTextAtSize(TEXTO_MARCA_AGUA, tamanoTexto)
    const pasoX = anchoTexto + 60
    const pasoY = 90

    for (let y = -height; y < height * 2; y += pasoY) {
      for (let x = -width; x < width * 2; x += pasoX) {
        pagina.drawText(TEXTO_MARCA_AGUA, {
          x,
          y,
          size: tamanoTexto,
          font,
          color: rgb(0.6, 0.6, 0.6),
          opacity: 0.25,
          rotate: degrees(45),
        })
      }
    }
  }

  const bytesFinal = await pdfDoc.save()
  return Buffer.from(bytesFinal)
}
