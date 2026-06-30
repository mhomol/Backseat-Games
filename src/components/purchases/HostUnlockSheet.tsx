import { Linking, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { APP_URLS } from '@/constants/urls';
import { borders, colors, fonts, radii, spacing } from '@/theme';

type HostUnlockSheetProps = {
  visible: boolean;
  priceLabel: string;
  busy: boolean;
  onPurchase: () => void;
  onRestore: () => void;
  onDismiss: () => void;
};

const BULLETS = [
  'One-time purchase — start games forever on this Apple ID.',
  'Passengers join for free — riders never pay.',
  'All three games included — license plates, sign game, and bingo.',
];

export function HostUnlockSheet({
  visible,
  priceLabel,
  busy,
  onPurchase,
  onRestore,
  onDismiss,
}: HostUnlockSheetProps) {
  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onDismiss}>
      <Pressable style={styles.overlay} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>Unlock starting games</Text>
          <Text style={styles.lead}>
            You tapped Start a Game. This one-time unlock lets you create sessions for everyone
            in the car — joining stays free for passengers.
          </Text>

          <View style={styles.bullets}>
            {BULLETS.map((bullet) => (
              <Text key={bullet} style={styles.bullet}>
                • {bullet}
              </Text>
            ))}
          </View>

          <BigButton
            label={`Unlock for ${priceLabel}`}
            onPress={onPurchase}
            loading={busy}
            variant="accent"
          />
          <BigButton label="Restore purchases" onPress={onRestore} disabled={busy} variant="secondary" />
          <Pressable onPress={onDismiss} disabled={busy} style={styles.dismiss}>
            <Text style={styles.dismissLabel}>Not now</Text>
          </Pressable>

          <Text style={styles.legal}>
            One-time purchase for life on this Apple ID. No subscription.{' '}
            <Text style={styles.link} onPress={() => void Linking.openURL(APP_URLS.privacy)}>
              Privacy policy
            </Text>
          </Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    borderWidth: borders.extraThick,
    borderColor: colors.skyBlueDark,
    borderBottomWidth: 0,
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 28,
    color: colors.roadGray,
    textAlign: 'center',
  },
  lead: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGrayLight,
    textAlign: 'center',
    lineHeight: 24,
  },
  bullets: {
    gap: spacing.xs,
  },
  bullet: {
    fontFamily: fonts.body,
    fontSize: 15,
    color: colors.roadGray,
    lineHeight: 22,
  },
  dismiss: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  dismissLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.roadGrayLight,
  },
  legal: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.roadGrayLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  link: {
    color: colors.skyBlueDark,
    textDecorationLine: 'underline',
  },
});
