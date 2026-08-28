import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useApp } from '../context/AppContext';
import BottomNav from '../components/BottomNav';
import ActionSheet from '../components/ActionSheet';
import LowestPriceRibbon from '../components/LowestPriceRibbon';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';
import { globalStyles } from '../styles/globalStyles';

export default function HomeScreen({ navigation }) {
  const { currentUser, goldRate, silverRate, holdings } = useApp();
  const [metalTab, setMetalTab] = useState('gold'); // 'gold' | 'silver'
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  const handleNavigate = (screen, params = {}) => {
    setIsActionSheetOpen(false);
    if (screen === 'buy' || screen === 'buy-gold') {
      navigation.navigate('BuyNow', { assetType: 'gold', ...params });
    } else if (screen === 'buy-silver') {
      navigation.navigate('BuyNow', { assetType: 'silver', ...params });
    } else if (screen === 'holdings') {
      navigation.navigate('Holdings', { fromScreen: 'home', ...params });
    } else if (screen === 'profile') {
      navigation.navigate('Profile', params);
    } else if (screen === 'withdraw') {
      navigation.navigate('Withdraw', { fromScreen: 'home', ...params });
    } else if (screen === 'transactions') {
      navigation.navigate('TransactionHistory', { fromScreen: 'home', ...params });
    } else if (screen === 'contact') {
      navigation.navigate('ContactUs', { fromScreen: 'home', ...params });
    }
  };

  const currentRate = metalTab === 'gold' ? goldRate : silverRate;
  const currentGrams = metalTab === 'gold' ? (Number(holdings?.goldGrams) || 0) : (Number(holdings?.silverGrams) || 0);

  return (
    <View style={globalStyles.container}>
      {/* 1. Fixed Top Header Banner */}
      <View style={styles.headerBanner}>
        <View style={styles.greetingCol}>
          <Text style={styles.greetingHello}>Hello,</Text>
          <Text style={styles.greetingName} numberOfLines={1}>
            {currentUser?.name || 'Customer'} !
          </Text>
        </View>

        {/* Dynamic Rate Badge Box */}
        <View style={styles.rateBadgeBox}>
          <View style={styles.rateHeaderRow}>
            <View style={styles.karatBadge}>
              <Text style={styles.karatBadgeText}>24KT</Text>
            </View>
            <Text style={styles.rateLabelText}>
              {metalTab === 'gold' ? 'Gold Rate' : 'Silver Rate'}
            </Text>
          </View>
          <Text style={styles.rateValueText}>
            Rs. {Number(currentRate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}/gm
          </Text>
        </View>
      </View>

      {/* 2. Middle Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Asset Card */}
        <View style={styles.mainAssetCard}>
          {/* LOWEST PRICE Ribbon */}
          <LowestPriceRibbon />

          {/* Gold / Silver Toggle Pills */}
          <View style={styles.metalTogglePill}>
            <TouchableOpacity
              style={[styles.metalTabBtn, metalTab === 'gold' && styles.metalTabBtnActive]}
              onPress={() => setMetalTab('gold')}
              activeOpacity={0.8}
            >
              <Text style={[styles.metalTabText, metalTab === 'gold' && styles.metalTabTextActive]}>
                Gold
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.metalTabBtn, metalTab === 'silver' && styles.metalTabBtnActive]}
              onPress={() => setMetalTab('silver')}
              activeOpacity={0.8}
            >
              <Text style={[styles.metalTabText, metalTab === 'silver' && styles.metalTabTextActive]}>
                Silver
              </Text>
            </TouchableOpacity>
          </View>

          {/* Balance Inner Card */}
          <View style={styles.balanceInnerCard}>
            <Text style={styles.balanceTitle}>Your balance</Text>

            {metalTab === 'gold' ? (
              <View style={styles.balanceContent}>
                <View style={styles.goldCoinCircle}>
                  <Svg width={24} height={24} viewBox="0 0 24 24">
                    <Circle cx="12" cy="7" r="5" fill="#e5a415" />
                    <Circle cx="12" cy="12" r="5" fill="#f5c242" />
                    <Circle cx="12" cy="17" r="5" fill="#e5a415" />
                  </Svg>
                </View>
                <Text style={styles.balanceAssetLabel}>Gold</Text>
                <Text style={styles.balanceAmountText}>
                  {currentGrams.toFixed(4)} gm
                </Text>
              </View>
            ) : (
              <View style={styles.balanceContent}>
                <View style={styles.silverCoinCircle}>
                  <Svg width={24} height={24} viewBox="0 0 24 24">
                    <Circle cx="12" cy="7" r="5" fill="#a0aab4" />
                    <Circle cx="12" cy="12" r="5" fill="#ccd3db" />
                    <Circle cx="12" cy="17" r="5" fill="#a0aab4" />
                  </Svg>
                </View>
                <Text style={styles.balanceAssetLabel}>Silver</Text>
                <Text style={styles.balanceAmountText}>
                  {currentGrams.toFixed(4)} gm
                </Text>
              </View>
            )}
          </View>

          {/* Subtitle Promo text */}
          <Text style={styles.promoText}>
            Buy {metalTab} daily, at your{'\n'}convenience price @ Salem Jewels
          </Text>

          {/* Buy Now CTA Button */}
          <TouchableOpacity
            style={globalStyles.primaryButton}
            onPress={() => handleNavigate(metalTab === 'gold' ? 'buy-gold' : 'buy-silver')}
            activeOpacity={0.8}
          >
            <Text style={globalStyles.primaryButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>

        {/* Shop Card */}
        <View style={styles.shopCard}>
          <Text style={styles.shopTitle}>Shop</Text>
          <TouchableOpacity
            style={styles.coinsBtn}
            activeOpacity={0.8}
            onPress={() => handleNavigate('buy-gold')}
          >
            <Text style={styles.coinsBtnText}>Coins →</Text>
          </TouchableOpacity>
          <Text style={styles.shopSubtext}>
            Explore certified 24KT pure gold and 99.9% silver coins with tamper-proof packaging.
          </Text>
        </View>
      </ScrollView>

      {/* 3. Fixed Bottom Nav */}
      <BottomNav
        activeTab="home"
        onSelectTab={handleNavigate}
        onTogglePlus={() => setIsActionSheetOpen(true)}
      />

      {/* Quick Menu Action Sheet Modal */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={() => setIsActionSheetOpen(false)}
        onNavigate={handleNavigate}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  headerBanner: {
    backgroundColor: COLORS.primaryPurple,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 20,
  },
  greetingCol: {
    flex: 1,
    paddingRight: 10,
  },
  greetingHello: {
    fontSize: 15,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  greetingName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  rateBadgeBox: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: RADIUS.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    minWidth: 145,
  },
  rateHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  karatBadge: {
    backgroundColor: COLORS.yellowAccent,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  karatBadgeText: {
    color: '#000000',
    fontSize: 9.5,
    fontWeight: '900',
  },
  rateLabelText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#ffb948',
  },
  rateValueText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#ffffff',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 95,
  },
  mainAssetCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.xl,
    padding: 20,
    position: 'relative',
    overflow: 'visible',
    marginBottom: 16,
    ...SHADOWS.light,
  },
  metalTogglePill: {
    backgroundColor: '#f1ecfe',
    borderRadius: 30,
    padding: 4,
    flexDirection: 'row',
    alignSelf: 'center',
    width: 220,
    marginBottom: 16,
  },
  metalTabBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metalTabBtnActive: {
    backgroundColor: COLORS.primaryPurple,
  },
  metalTabText: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#736d85',
  },
  metalTabTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },
  balanceInnerCard: {
    backgroundColor: '#f6f2ff',
    borderRadius: RADIUS.lg,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e8e2fa',
  },
  balanceTitle: {
    color: COLORS.primaryPurple,
    fontWeight: '700',
    fontSize: 13.5,
    marginBottom: 10,
  },
  balanceContent: {
    alignItems: 'center',
  },
  goldCoinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fde9b8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  silverCoinCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#e2e6ea',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  balanceAssetLabel: {
    fontSize: 13.5,
    color: '#736d85',
    fontWeight: '700',
  },
  balanceAmountText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1c1829',
    marginTop: 2,
  },
  promoText: {
    textAlign: 'center',
    fontSize: 13.5,
    color: '#3d3852',
    fontWeight: '600',
    lineHeight: 18,
    marginBottom: 16,
  },
  shopCard: {
    backgroundColor: COLORS.primaryPurple,
    borderRadius: RADIUS.xl,
    padding: 22,
    marginBottom: 16,
    ...SHADOWS.medium,
  },
  shopTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 12,
  },
  coinsBtn: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  coinsBtnText: {
    color: COLORS.primaryPurple,
    fontWeight: '800',
    fontSize: 14,
  },
  shopSubtext: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12.5,
    lineHeight: 18,
    fontWeight: '500',
  },
});
