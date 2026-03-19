/**
 * Utility to compress images on the client side using Canvas.
 * This helps reduce payload size for large dataset uploads.
 */
export const compressImage = async (file: File, maxWidth = 1280, quality = 0.6): Promise<File> => {
  // Only compress images
  if (!file.type.startsWith('image/')) {
    return file
  }

  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      // Calculate new dimensions
      if (width > maxWidth) {
        height = (maxWidth / width) * height
        width = maxWidth
      }

      canvas.width = width
      canvas.height = height

      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Failed to get canvas context'))

      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error('Canvas toBlob failed'))

          const compressedFile = new File([blob], file.name, {
            type: 'image/jpeg',
            lastModified: Date.now()
          })
          resolve(compressedFile)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }

    img.src = url
  })
}
