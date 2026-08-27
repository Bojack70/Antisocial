import React, { createContext, useCallback, useRef, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Text from './AppText';
import { shareCardImage } from '../lib/shareCard';

// Cards consume this via CardHeader to render the share icon.
// Null while capturing (or outside a ShareableCard) hides the icon
// so it never appears in the exported image.
export const ShareContext = createContext<(() => void) | null>(null);

interface ShareableCardProps {
  children: React.ReactNode;
  shareName?: string;
}

export default function ShareableCard({ children, shareName }: ShareableCardProps) {
  const ref = useRef<View>(null);
  const [capturing, setCapturing] = useState(false);

  const onShare = useCallback(async () => {
    setCapturing(true);
    // Let the capture frame + brand line paint before snapshotting.
    await new Promise((r) => setTimeout(r, 120));
    try {
      await shareCardImage(ref, shareName || 'modern-weirdness');
    } catch (e) {
      console.warn('Share capture failed:', e);
    } finally {
      setCapturing(false);
    }
  }, [shareName]);

  return (
    <ShareContext.Provider value={capturing ? null : onShare}>
      <View ref={ref} collapsable={false} style={capturing ? styles.captureFrame : undefined}>
        {children}
        {capturing && (
          <View style={styles.brandRow}>
            <Text style={styles.brandText}>Modern Weirdness — a museum of curiosity</Text>
          </View>
        )}
      </View>
    </ShareContext.Provider>
  );
}

const styles = StyleSheet.create({
  captureFrame: {
    backgroundColor: '#F7F7F5',
    padding: 14,
    paddingBottom: 0,
  },
  brandRow: {
    alignItems: 'center',
    paddingBottom: 14,
  },
  brandText: {
    fontSize: 11,
    letterSpacing: 0.4,
    color: '#8C8E92',
  },
});
