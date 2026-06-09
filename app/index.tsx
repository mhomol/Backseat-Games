import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BigButton } from '@/components/BigButton';
import { ScreenHeader } from '@/components/ScreenHeader';
import { borders, colors, fonts, radii, shadows, spacing } from '@/theme';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <View style={styles.hero}>
        <Text style={styles.emoji}>🚗</Text>
        <ScreenHeader
          title="Backseat Games"
          subtitle="Classic road-trip fun for the whole car"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardText}>
          One phone hosts. Everyone else joins nearby — no internet needed.
        </Text>
      </View>

      <View style={styles.actions}>
        <BigButton
          label="Start a Game"
          onPress={() => router.push('/host/setup')}
          variant="primary"
        />
        <BigButton
          label="Join a Game"
          onPress={() => router.push('/join')}
          variant="accent"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: spacing.lg,
    backgroundColor: colors.cream,
  },
  hero: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  emoji: {
    fontSize: 72,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.cloudWhite,
    borderWidth: borders.thick,
    borderColor: colors.skyBlueDark,
    borderRadius: radii.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.card,
  },
  cardText: {
    fontFamily: fonts.body,
    fontSize: 16,
    color: colors.roadGray,
    textAlign: 'center',
    lineHeight: 24,
  },
  actions: {
    gap: spacing.md,
  },
});
