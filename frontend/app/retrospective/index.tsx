import React, { useRef, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import Text from '../../components/AppText';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, type } from '../../lib/theme';
import { shareCardImage } from '../../lib/shareCard';

interface RetroPhoto {
  id: string;
  uri: string; // data URL — the photo never leaves this device
  year: string;
  caption: string;
}

const MAX_PHOTOS = 8;

// The Retrospective: a side room where the visitor curates an exhibit of
// one person — themselves, across the years. Everything happens on the
// device: photos are read into memory, arranged, captured as one image via
// the existing share pipeline, and never uploaded anywhere. The museum has
// deliberately been given no storage room for this; that is a privacy
// decision, not a missing feature.
export default function Retrospective() {
  const router = useRouter();
  const [photos, setPhotos] = useState<RetroPhoto[]>([]);
  const [exporting, setExporting] = useState(false);
  const stripRef = useRef<View>(null);

  // Web-only by design for now: the deployed product is the web app, and
  // a DOM file input needs no new native dependency. Native gets an
  // honest note instead of a broken button.
  const canAdd = Platform.OS === 'web';

  const addPhotos = () => {
    if (!canAdd) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files ?? []);
      for (const file of files) {
        const reader = new FileReader();
        reader.onload = () => {
          setPhotos((prev) =>
            prev.length >= MAX_PHOTOS
              ? prev
              : [
                  ...prev,
                  {
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                    uri: String(reader.result),
                    year: '',
                    caption: '',
                  },
                ]
          );
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const update = (id: string, patch: Partial<RetroPhoto>) =>
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const remove = (id: string) => setPhotos((prev) => prev.filter((p) => p.id !== id));

  // Display in year order once years are given; entries without a year
  // keep their place at the end rather than guessing.
  const ordered = [...photos].sort((a, b) => {
    const ya = parseInt(a.year, 10);
    const yb = parseInt(b.year, 10);
    if (isNaN(ya) && isNaN(yb)) return 0;
    if (isNaN(ya)) return 1;
    if (isNaN(yb)) return -1;
    return ya - yb;
  });

  const exportStrip = async () => {
    if (exporting || photos.length === 0) return;
    setExporting(true);
    try {
      // Give the capture styles one frame to settle, same as ShareableCard.
      await new Promise((r) => setTimeout(r, 120));
      await shareCardImage(stripRef, 'retrospective');
    } finally {
      setExporting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={colors.body} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>The Retrospective</Text>
          <Text style={styles.headerSubtitle}>An exhibit of one person</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Pick a few photographs of yourself across the years. Add a year and a line to each.
          The room assembles them into one image you can keep or send.
        </Text>
        <Text style={styles.privacyNote}>
          The photographs stay on this device. Nothing is uploaded — this room has no storage.
        </Text>

        {!canAdd && (
          <Text style={styles.webOnlyNote}>
            This room is web-only for now. Open antisocial.co.in in a browser.
          </Text>
        )}

        {canAdd && photos.length < MAX_PHOTOS && (
          <TouchableOpacity style={styles.addButton} onPress={addPhotos} activeOpacity={0.8}>
            <Ionicons name="images-outline" size={15} color={colors.body} />
            <Text style={styles.addButtonText}>
              {photos.length === 0 ? 'Add photographs' : 'Add another'}
            </Text>
          </TouchableOpacity>
        )}

        {photos.length > 0 && (
          <>
            {/* The capture target: everything inside this View becomes the
                exported image. collapsable={false} keeps the node real for
                view-shot on native, harmless on web. */}
            <View ref={stripRef} collapsable={false} style={styles.strip}>
              <Text style={styles.stripTitle}>A retrospective</Text>
              {ordered.map((p) => (
                <View key={p.id} style={styles.entry}>
                  <Image source={{ uri: p.uri }} style={styles.photo} contentFit="cover" />
                  {(p.year !== '' || p.caption !== '') && (
                    <View style={styles.entryText}>
                      {p.year !== '' && <Text style={styles.entryYear}>{p.year}</Text>}
                      {p.caption !== '' && <Text style={styles.entryCaption}>{p.caption}</Text>}
                    </View>
                  )}
                </View>
              ))}
              <Text style={styles.brandLine}>Modern Weirdness — a museum of curiosity</Text>
            </View>

            {/* Editing controls live OUTSIDE the capture target so the
                exported image carries none of the chrome. */}
            {ordered.map((p, i) => (
              <View key={`edit-${p.id}`} style={styles.editRow}>
                <Text style={styles.editIndex}>{i + 1}</Text>
                <TextInput
                  style={[styles.input, styles.inputYear]}
                  placeholder="Year"
                  placeholderTextColor={colors.muted}
                  value={p.year}
                  onChangeText={(t) => update(p.id, { year: t })}
                  maxLength={4}
                  keyboardType="number-pad"
                />
                <TextInput
                  style={[styles.input, styles.inputCaption]}
                  placeholder="One line about this one"
                  placeholderTextColor={colors.muted}
                  value={p.caption}
                  onChangeText={(t) => update(p.id, { caption: t })}
                  maxLength={80}
                />
                <TouchableOpacity onPress={() => remove(p.id)} style={styles.removeButton}>
                  <Ionicons name="close" size={16} color={colors.muted} />
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity
              style={styles.exportButton}
              onPress={exportStrip}
              disabled={exporting}
              activeOpacity={0.8}
            >
              <Text style={styles.exportButtonText}>
                {exporting ? 'Assembling…' : 'Keep the exhibit'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.surfaceTinted,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  backButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerSpacer: {
    width: 32,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.ink,
    letterSpacing: -0.45,
  },
  headerSubtitle: {
    ...type.micro,
    marginTop: 5,
  },
  scroll: {
    padding: 16,
    maxWidth: 480,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 48,
  },
  intro: {
    ...type.body,
  },
  privacyNote: {
    ...type.micro,
    marginTop: 10,
    lineHeight: 16,
  },
  webOnlyNote: {
    ...type.body,
    marginTop: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.body,
  },
  strip: {
    marginTop: 16,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 20,
  },
  stripTitle: {
    ...type.title,
    textAlign: 'center',
    marginBottom: 6,
  },
  entry: {
    marginTop: 14,
  },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 10,
    backgroundColor: '#F4F4F5',
  },
  entryText: {
    marginTop: 8,
  },
  entryYear: {
    ...type.micro,
  },
  entryCaption: {
    ...type.body,
    marginTop: 2,
  },
  brandLine: {
    ...type.micro,
    textAlign: 'center',
    marginTop: 18,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  editIndex: {
    ...type.micro,
    width: 14,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.hairline,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.ink,
    backgroundColor: colors.surface,
  },
  inputYear: {
    width: 70,
  },
  inputCaption: {
    flex: 1,
  },
  removeButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportButton: {
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: colors.ink,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
  },
});
