import JSZip from 'jszip';
import { ANDROID_FILES } from '../androidFilesData';

export async function downloadAndroidProjectZip(onProgress?: (percent: number) => void): Promise<void> {
  const zip = new JSZip();

  const rootFolder = zip.folder('JARVIS');
  if (!rootFolder) return;

  ANDROID_FILES.forEach((file) => {
    rootFolder.file(file.path, file.content);
  });

  if (onProgress) onProgress(30);

  const content = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'JARVIS-Android-Project.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
