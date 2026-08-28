import React from 'react';
import { Text as RNText, TextProps, StyleSheet, TextStyle } from 'react-native';

// Inter ships as one font file per weight, so a numeric fontWeight can't
// pick the right face on its own — the family name has to carry the weight.
// This wrapper does that translation once, so every card can keep writing
// plain `fontWeight: '500'` in its StyleSheet.
//
// Only the weights the app actually uses are loaded in app/_layout.tsx.
// Adding a new one means loading its file there and adding it here.
const UPRIGHT: Record<string, string> = {
  '400': 'Inter_400Regular',
  normal: 'Inter_400Regular',
  '500': 'Inter_500Medium',
  '600': 'Inter_600SemiBold',
  '700': 'Inter_700Bold',
  bold: 'Inter_700Bold',
};

// The app only ever italicises body-weight text, so one italic face covers
// every use. Load Inter_500Medium_Italic (etc.) if that ever changes.
const ITALIC = 'Inter_400Regular_Italic';

export default function AppText({ style, ...rest }: TextProps) {
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  // A style that names its own family — the Merriweather titles in
  // lib/theme.ts — has already picked its face, so the Inter lookup below
  // must not overwrite it. Everything else still gets weight-to-family
  // translation for free.
  const fontFamily = flat?.fontFamily
    ? flat.fontFamily
    : flat?.fontStyle === 'italic'
      ? ITALIC
      : UPRIGHT[String(flat?.fontWeight ?? '400')] ?? UPRIGHT['400'];

  // Weight and slant now live in the family, so they are cleared here —
  // left in place, the browser would synthesise a second layer of bold or
  // slant on top of a face that already has it.
  return (
    <RNText
      {...rest}
      style={[style, { fontFamily, fontWeight: 'normal', fontStyle: 'normal' }]}
    />
  );
}
