/**
 * OVERLOAD ScreenContainer
 * Premium luxury safe-area aware wrapper with warm palette
 */

import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import spacing from '../theme/spacing';

export default function ScreenContainer({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  withPadding = true,
  edges = ['top', 'bottom', 'left', 'right'],
  header,
  ...props
}) {
  const insets = useSafeAreaInsets();

  const containerPadding = {
    paddingTop: edges.includes('top') ? Math.max(insets.top, spacing.xs) : 0,
    paddingBottom: edges.includes('bottom') ? Math.max(insets.bottom, spacing.md) : 0,
    paddingLeft: edges.includes('left') ? (withPadding ? spacing.screenPadding : 0) : 0,
    paddingRight: edges.includes('right') ? (withPadding ? spacing.screenPadding : 0) : 0,
  };

  return (
    <View style={[styles.root, style]}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAF8F5" translucent />
      {header}
      {scrollable ? (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            containerPadding,
            contentContainerStyle,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...props}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.staticContent, containerPadding, contentContainerStyle]}>
          {children}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#FAF8F5',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  staticContent: {
    flex: 1,
  },
});
