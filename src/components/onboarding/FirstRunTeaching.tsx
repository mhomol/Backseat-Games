import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton } from '@/components/BigButton';
import { borders, colors, fonts, radii, spacing } from '@/theme';

const CARDS = [
  {
    title: 'Solo is always free',
    body: 'Start a Game anytime and play License Plates, Sign Game, or Travel Bingo offline on this phone — no purchase needed.',
  },
  {
    title: 'Play online when the car joins',
    body: 'Turn on Play online to share a join code. Passengers type the code on their phones — works on cellular or Wi‑Fi. Joining stays free.',
  },
  {
    title: 'Unlock once to host online',
    body: 'One-time purchase — not a subscription — unlocks hosting with a join code forever on this Apple ID. Restore anytime on a new phone.',
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
