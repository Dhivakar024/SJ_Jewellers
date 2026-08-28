import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { Hand, FileText, Phone, X } from 'lucide-react-native';
import { COLORS, RADIUS, SHADOWS } from '../constants/theme';

export default function ActionSheet({ isOpen, onClose, onNavigate }) {
  if (!isOpen) return null;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.sheetContainer}>
              {/* Sheet Items */}
              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  onNavigate('withdraw', { from: 'home', source: 'plus-menu' });
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Hand size={22} color={COLORS.primaryPurple} />
                </View>
                <Text style={styles.sheetItemText}>Mode of Withdraw</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  onNavigate('transactions', { from: 'home', source: 'plus-menu' });
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <FileText size={22} color={COLORS.primaryPurple} />
                </View>
                <Text style={styles.sheetItemText}>Transaction History</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.sheetItem}
                onPress={() => {
                  onNavigate('contact', { from: 'home', source: 'plus-menu' });
                  onClose();
                }}
                activeOpacity={0.7}
              >
                <View style={styles.iconCircle}>
                  <Phone size={22} color={COLORS.primaryPurple} />
                </View>
                <Text style={styles.sheetItemText}>Contact Us</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={onClose}
                activeOpacity={0.8}
              >
                <X size={24} color="#ffffff" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 13, 25, 0.65)',
    justifyContent: 'flex-end',
  },
  sheetContainer: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingTop: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
    gap: 12,
    ...SHADOWS.medium,
  },
  sheetItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.bgCardPurpleSoft,
    borderWidth: 1,
    borderColor: COLORS.borderSubtle,
    gap: 14,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.bgCardPurpleLighter,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetItemText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  closeBtn: {
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryPurple,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...SHADOWS.primaryBtn,
  },
});
