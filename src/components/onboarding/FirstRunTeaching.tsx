import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const CARDS = [
  {
    title: 'One host, everyone plays',
    body: 'Someone starts a game and shares a short join code. Passengers type the code on their phones — works on cellular or Wi‑Fi.',
  },
  {
    title: 'Joining is always free',
    body: 'Riders never pay. Only the person who starts games needs the host unlock.',
  },
  {
    title: 'Host unlock is one-time, for life',
    body: 'Pay once — not a subscription. Host forever on this Apple ID. Restore purchases anytime if you get a new phone.',
  },
] as const;

type FirstRunTeachingProps = {
  visible: boolean;
  onDone: () => void;
};

export function FirstRunTeaching({ visible, onDone }: FirstRunTeachingProps) {
  const [index, setIndex] = useState(0);
  const card = CARDS[index]!;
  const isLast = index === CARDS.length - 1;

  useEffect(() => {
    if (visible) {
      setIndex(0);
    }
  }, [visible]);

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onDone}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>
            {index + 1} of {CARDS.length}
          </Text>
          <Text style={styles.title}>{card.title}</Text>
          <Text style={styles.body}>{card.body}</Text>
          <BigButton
            label={isLast ? "Let's play" : 'Next'}
            variant="accent"
            onPress={() => {
              if (isLast) {
                onDone();
                return;
              }
              setIndex((value) => value + 1);
            }}
          />
          {!isLast ? (
            <Pressable onPress={onDone} style={styles.skip}>
              <Text style={styles.skipLabel}>Skip</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(45, 52, 54, 0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.cream,
    borderRadius: radii.xl,
    borderWidth: borders.extraThick,
    borderColor: colors.skyBlueDark,
    padding: spacing.lg,
    gap: spacing.md,
  },
  eyebrow: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.roadGrayLight,
    textAlign: 'center',
  },
  title: {
    fontFamily: fonts.displayBold,
    fontSize: 26,
    color: colors.roadGray,
    textAlign: 'center',
  },
  body: {
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    color: colors.roadGrayLight,
    textAlign: 'center',
  },
  skip: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  skipLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.roadGrayLight,
  },
});
