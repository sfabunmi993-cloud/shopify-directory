// Client-side video compression using the browser's MediaRecorder + canvas API.
// Re-encodes large phone/video files into a much smaller webm before upload,
// so the actual upload transfers far less data and finishes faster.
// Falls back to the original file if the browser cannot compress.

export async function compressVideo(
  file,
  {
    maxWidth = 1280,
    fps = 30,
    videoBitrate = 1_500_000,
    audioBitrate = 128_000,
    onProgress,
  } = {}
) {
  if (!file.type.startsWith('video/')) return file;
  if (typeof MediaRecorder === 'undefined' || typeof document === 'undefined') return file;

  const url = URL.createObjectURL(file);
  const video = document.createElement('video');
  video.src = url;
  video.muted = true;
  video.playsInline = true;

  try {
    await new Promise((res, rej) => {
      video.onloadedmetadata = res;
      video.onerror = rej;
    });

    const duration = video.duration;
    if (!duration || !isFinite(duration)) return file;

    const scale = Math.min(1, maxWidth / Math.max(1, video.videoWidth));
    const w = Math.max(2, Math.round((video.videoWidth || maxWidth) * scale / 2) * 2);
    const h = Math.max(2, Math.round((video.videoHeight || 720) * scale / 2) * 2);

    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const stream = canvas.captureStream(fps);

    // Attach the original audio track (if any) so the compressed file keeps sound.
    try {
      const vs = video.captureStream ? video.captureStream() : video.mozCaptureStream?.();
      vs?.getAudioTracks().forEach((t) => stream.addTrack(t));
    } catch {
      // no audio available — proceed with video only
    }

    const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
      ? 'video/webm;codecs=vp9,opus'
      : 'video/webm';

    let recorder;
    try {
      recorder = new MediaRecorder(stream, {
        mimeType: mime,
        videoBitsPerSecond: videoBitrate,
        audioBitsPerSecond: audioBitrate,
      });
    } catch {
      return file;
    }

    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data);
    };
    const stopped = new Promise((res) => { recorder.onstop = res; });

    recorder.start();
    await video.play();

    let raf;
    const draw = () => {
      try { ctx.drawImage(video, 0, 0, w, h); } catch { /* ignore transient frame errors */ }
      if (onProgress) onProgress(Math.min(0.99, video.currentTime / duration));
      if (!video.ended) raf = requestAnimationFrame(draw);
    };
    draw();

    await new Promise((res) => { video.onended = res; });
    if (raf) cancelAnimationFrame(raf);
    if (recorder.state !== 'inactive') recorder.stop();
    await stopped;

    if (onProgress) onProgress(1);

    const blob = new Blob(chunks, { type: 'video/webm' });
    if (!blob.size) return file;

    const outName = file.name.replace(/\.[^.]+$/, '') + '.webm';
    return new File([blob], outName, { type: 'video/webm' });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(url);
  }
}