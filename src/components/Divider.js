/**
 * OVERLOAD Divider
 * Premium luxury visual separator with warm palette
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import spacing from '../theme/spacing';

export default function Divider({
  color = '#E8E4DE',
  spacingVertical = spacing.md,
  style,
}) {
  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: color,
          marginVertical: spacingVertical,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    width: '100%',
  },
});
