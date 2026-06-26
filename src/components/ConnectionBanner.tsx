import { StyleSheet, Text, View } from 'react-native';
import { borders, colors, fonts, radii, spacing } from '@/theme';

type ConnectionBannerProps = {
  status: 'reconnecting' | 'disconnected';
};

const MESSAGES = {
  reconnecting: 'Reconnecting… keep the app open.',
  disconnected:
    'Connection lost. Re-open the app and re-enter the host join code with the same name.',
} as const;

export function ConnectionBanner({ status }: ConnectionBannerProps) {
  return (
    <View
      style={[
        styles.banner,
        status === 'disconnected' ? styles.disconnected : styles.reconnecting,
      ]}
    >
      <Text style={styles.text}>{MESSAGES[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: borders.thick,
    borderColor: colors.roadGray,
    borderRadius: radii.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  reconnecting: {
    backgroundColor: colors.sunnyYellow,
  },
  disconnected: {
    backgroundColor: '#FFD6E8',
  },
  text: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.roadGray,
    textAlign: 'center',
    lineHeight: 20,
  },
});
