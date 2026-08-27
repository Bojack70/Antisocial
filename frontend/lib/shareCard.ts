import { Platform, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

const SHARE_CAPTION = 'From Modern Weirdness — a museum of curiosity.';

// Capture a card view as a PNG and hand it to the platform share sheet.
// Web: Web Share API with files when available, else a straight download.
// Native: expo-sharing with the captured tmpfile.
export async function shareCardImage(
  ref: React.RefObject<any>,
  fileName: string = 'modern-weirdness'
): Promise<void> {
  if (Platform.OS === 'web') {
    // view-shot's captureRef goes through findNodeHandle, which react-native-web
    // does not support (as of view-shot 4.0.3) — capture the DOM node with
    // html2canvas directly instead.
    const html2canvas = (await import('html2canvas')).default;
    const canvas = await html2canvas(ref.current as unknown as HTMLElement, {
      backgroundColor: '#F7F7F5',
      scale: 2,
      useCORS: true,
    });
    const dataUri = canvas.toDataURL('image/png');
    const blob = await (await fetch(dataUri)).blob();
    const file = new File([blob], `${fileName}.png`, { type: 'image/png' });
    const nav = navigator as any;
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], text: SHARE_CAPTION });
        return;
      } catch {
        // User cancelled or share failed — fall through to download.
      }
    }
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = `${fileName}.png`;
    a.click();
  } else {
    const uri = await captureRef(ref, { format: 'png', quality: 1 });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: SHARE_CAPTION,
      });
    } else {
      await Share.share({ message: SHARE_CAPTION });
    }
  }
}
