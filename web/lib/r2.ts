import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const r2 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!

// El bucket es privado (las fotos son de menores — ver política de privacidad en CLAUDE.md).
// Guardamos solo la "key" del objeto en la DB y generamos URLs firmadas temporales para mostrarlas.
export async function subirArchivo(key: string, body: Buffer, contentType: string): Promise<string> {
  await r2.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  )
  return key
}

export async function obtenerUrlFirmada(key: string, expiraEnSegundos = 3600): Promise<string> {
  const command = new GetObjectCommand({ Bucket: BUCKET, Key: key })
  return getSignedUrl(r2, command, { expiresIn: expiraEnSegundos })
}

export async function descargarArchivo(key: string): Promise<{ buffer: Buffer; contentType: string }> {
  const res = await r2.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }))
  const bytes = await res.Body!.transformToByteArray()
  return { buffer: Buffer.from(bytes), contentType: res.ContentType || 'image/jpeg' }
}

// Borra hasta 1000 objetos de una — el límite de DeleteObjects de S3/R2 por request.
// Un pedido nunca tiene tantos archivos, así que no hace falta paginar en lotes.
export async function eliminarArchivos(keys: string[]): Promise<void> {
  if (keys.length === 0) return
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    }),
  )
}
