import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../components/ScreenContainer';
import { useTheme } from '../context/ThemeContext';
import { MoreStackParamList } from '../navigation/types';
import { spacing } from '../constants/theme';

type Nav = NativeStackNavigationProp<MoreStackParamList, 'MoreMenu'>;

const MENU_ITEMS: { screen: keyof MoreStackParamList; label: string; icon: keyof typeof Ionicons.glyphMap; subtitle: string }[] = [
  { screen: 'Reports', label: 'Reports & Insights', icon: 'stats-chart', subtitle: 'Symptom averages, adherence, lab trends' },
  { screen: 'PeriodTracker', label: 'Period Tracker', icon: 'calendar', subtitle: 'Log flow and cycle predictions' },
  { screen: 'FoodJournal', label: 'Food Journal', icon: 'restaurant', subtitle: 'Track meals and nutrition notes' },
  { screen: 'Notes', label: 'Notes & Journal', icon: 'document-text', subtitle: 'Qualitative observations with tags' },
  { screen: 'Profile', label: 'Profile', icon: 'person', subtitle: 'Name, meds, baseline labs' },
  { screen: 'Settings', label: 'Settings', icon: 'settings', subtitle: 'Theme, units, preferences' },
];

export default function MoreMenuScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <ScreenContainer>
      {MENU_ITEMS.map((item) => (
        <Pressable
          key={item.screen}
          style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate(item.screen)}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.primary + '18' }]}>
            <Ionicons name={item.icon} size={22} color={colors.primary} />
          </View>
          <View style={styles.textWrap}>
            <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{item.subtitle}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: spacing.sm,
    marginTop: spacing.xs,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  textWrap: { flex: 1 },
  label: { fontSize: 16, fontWeight: '600', marginBottom: 2 },
});
