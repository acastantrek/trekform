// Extracts the video id from the usual YouTube URL shapes (watch, youtu.be, embed, shorts).
export function getYoutubeId(url: string | null | undefined) {
  if (!url) return null
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/,
  )
  return match ? match[1] : null
}
