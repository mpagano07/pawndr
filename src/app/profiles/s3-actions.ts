'use server'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { s3Client } from '@/lib/s3'
import { createClient } from '@/utils/supabase/server'

export async function getPresignedUploadUrl(fileName: string, contentType: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const bucketName = process.env.AWS_BUCKET_NAME
  const region = process.env.AWS_REGION || 'us-east-2'
  if (!bucketName) {
    return { error: 'AWS Bucket Name is not configured' }
  }

  // Generate unique file name in subfolder named after user ID
  const fileExt = fileName.split('.').pop() || 'jpg'
  const cleanFileName = `${user.id}/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: cleanFileName,
      ContentType: contentType,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 })
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${cleanFileName}`

    return { success: true, uploadUrl, publicUrl }
  } catch (error: any) {
    console.error('[getPresignedUploadUrl Error]:', error)
    return { error: error.message || 'Failed to generate upload URL' }
  }
}
