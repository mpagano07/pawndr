'use server'

import { getPresignedUploadUrl } from '@/app/profiles/s3-actions'

export async function getLostFoundUploadUrl(fileName: string, contentType: string) {
  // Reutilizamos la función de presigned URLs del módulo de perfiles
  return getPresignedUploadUrl(fileName, contentType)
}
