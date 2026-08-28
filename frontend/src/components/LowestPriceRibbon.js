import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function LowestPriceRibbon() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={styles.ribbon}>
        <Text style={styles.text}>LOWEST PRICE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
    overflow: 'hidden',
    borderTopRightRadius: 24,
    zIndex: 10,
  },
  ribbon: {
    position: 'absolute',
    top: 18,
    right: -26,
    width: 120,
    backgroundColor: COLORS.orangeRibbon,
    paddingVertical: 3.5,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    color: '#ffffff',
    fontSize: 8.5,
    fontWeight: '900',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
});
