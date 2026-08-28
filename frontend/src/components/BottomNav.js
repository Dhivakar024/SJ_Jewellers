import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Home, Wallet, FolderClosed, User, Plus } from 'lucide-react-native';
import { COLORS, SHADOWS } from '../constants/theme';

export default function BottomNav({ activeTab, onSelectTab, onTogglePlus }) {
  return (
    <View style={styles.navContainer}>
      {/* Home Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectTab('home')}
        activeOpacity={0.7}
      >
        <Home
          size={22}
          color={activeTab === 'home' ? COLORS.yellowAccent : '#ffffff'}
          strokeWidth={activeTab === 'home' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
          Home
        </Text>
      </TouchableOpacity>

      {/* Buy Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectTab('buy')}
        activeOpacity={0.7}
      >
        <Wallet
          size={22}
          color={activeTab === 'buy' ? COLORS.yellowAccent : '#ffffff'}
          strokeWidth={activeTab === 'buy' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeTab === 'buy' && styles.navTextActive]}>
          Buy
        </Text>
      </TouchableOpacity>

      {/* Center Floating Plus Button */}
      <View style={styles.plusButtonWrapper}>
        <TouchableOpacity
          style={styles.floatingPlusBtn}
          onPress={onTogglePlus}
          activeOpacity={0.8}
        >
          <Plus size={28} color="#1c1829" strokeWidth={3} />
        </TouchableOpacity>
      </View>

      {/* Holdings Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectTab('holdings')}
        activeOpacity={0.7}
      >
        <FolderClosed
          size={22}
          color={activeTab === 'holdings' ? COLORS.yellowAccent : '#ffffff'}
          strokeWidth={activeTab === 'holdings' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeTab === 'holdings' && styles.navTextActive]}>
          Holdings
        </Text>
      </TouchableOpacity>

      {/* Profile Tab */}
      <TouchableOpacity
        style={styles.navItem}
        onPress={() => onSelectTab('profile')}
        activeOpacity={0.7}
      >
        <User
          size={22}
          color={activeTab === 'profile' ? COLORS.yellowAccent : '#ffffff'}
          strokeWidth={activeTab === 'profile' ? 2.5 : 2}
        />
        <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: COLORS.primaryPurple,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
    paddingBottom: Platform.OS === 'ios' ? 12 : 6,
    zIndex: 100,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    ...SHADOWS.medium,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  navText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  navTextActive: {
    color: COLORS.yellowAccent,
    fontWeight: '900',
  },
  plusButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 72,
  },
  floatingPlusBtn: {
    position: 'absolute',
    top: -24,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: COLORS.yellowAccent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
});
