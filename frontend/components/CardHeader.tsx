import React, { useContext } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Text from './AppText';
import { Ionicons } from '@expo/vector-icons';
import { ShareContext } from './ShareableCard';
import { colors, type } from '../lib/theme';

interface CardHeaderProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  tone?: 'light' | 'dark';
  badge?: React.ReactNode;
}

// The one header system for every feed card. The icon and the label
// beside it both carry the card type's accent colour, so the top of the
// card reads as a single marker rather than an icon next to grey text.
export default function CardHeader({ icon, color, label, tone = 'light', badge }: CardHeaderProps) {
  const onShare = useContext(ShareContext);

  return (
    <View style={styles.header}>
      <Ionicons name={icon} size={17} color={color} />
      <Text style={[styles.label, { color }]}>{label}</Text>
      {badge}
      {onShare && (
        <TouchableOpacity
          style={styles.shareButton}
          onPress={onShare}
          activeOpacity={0.6}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons
            name="share-outline"
            size={15}
            color={tone === 'dark' ? colors.darkLine : colors.hairline}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 14,
  },
  label: {
    ...type.label,
    flex: 1,
  },
  shareButton: {
    marginLeft: 8,
  },
});
