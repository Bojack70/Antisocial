import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ShareContext } from './ShareableCard';

interface CardHeaderProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  label: string;
  badge?: React.ReactNode;
}

// The one header system for every feed card: small uppercase label,
// tinted in the card type's accent color, with an optional right-side
// badge and the share affordance when the card is shareable.
export default function CardHeader({ icon, color, label, badge }: CardHeaderProps) {
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
          <Ionicons name="share-outline" size={16} color="#B4B6BA" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    flex: 1,
  },
  shareButton: {
    marginLeft: 8,
  },
});
