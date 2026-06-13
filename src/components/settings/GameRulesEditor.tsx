import { StyleSheet, Text, View } from 'react-native';
import type { GameType } from '@/types/game';
import type { GameRules } from '@/types/preferences';
import { summarizeGameRules } from '@/data/gameRulesCopy';
import { colors, fonts, spacing } from '@/theme';
import { SettingsToggle } from './SettingsToggle';

type GameRulesEditorProps = {
  gameType: GameType;
  rules: GameRules;
  onChange: (partial: Partial<GameRules>) => void;
  readOnly?: boolean;
};

export function GameRulesEditor({
  gameType,
  rules,
  onChange,
  readOnly = false,
}: GameRulesEditorProps) {
  if (readOnly) {
    return (
      <View style={styles.readOnly}>
        {summarizeGameRules(gameType, rules).map((line) => (
          <Text key={line} style={styles.summaryLine}>
            • {line}
          </Text>
        ))}
      </View>
    );
  }

  switch (gameType) {
    case 'sign-game':
      return (
        <View style={styles.group}>
          <SettingsToggle
            label="Q, X, Z anywhere in word"
            description="Off means those letters must start the word."
            value={rules['sign-game'].qxzMatchMode === 'anywhere'}
            onValueChange={(value) =>
              onChange({
                'sign-game': {
                  ...rules['sign-game'],
                  qxzMatchMode: value ? 'anywhere' : 'starts-with',
                },
              })
            }
          />
          <SettingsToggle
            label="Allow duplicate words"
            description="Same word can be used by multiple players."
            value={rules['sign-game'].allowDuplicateWords}
            onValueChange={(value) =>
              onChange({
                'sign-game': { ...rules['sign-game'], allowDuplicateWords: value },
              })
            }
          />
          <SettingsToggle
            label="Voice input"
            description="Say the word aloud — converted to text on your phone (typing always works)."
            value={rules['sign-game'].enableRecordings}
            onValueChange={(value) =>
              onChange({
                'sign-game': { ...rules['sign-game'], enableRecordings: value },
              })
            }
          />
        </View>
      );
    case 'license-plates':
      return (
        <SettingsToggle
          label="Allow unclaiming plates"
          description="Players can tap their plates again to release them."
          value={rules['license-plates'].allowUnclaim}
          onValueChange={(value) =>
            onChange({
              'license-plates': { ...rules['license-plates'], allowUnclaim: value },
            })
          }
        />
      );
    case 'bingo':
      return (
        <SettingsToggle
          label="Blackout wins"
          description="Off means any row, column, or diagonal wins."
          value={rules.bingo.winMode === 'blackout'}
          onValueChange={(value) =>
            onChange({
              bingo: { ...rules.bingo, winMode: value ? 'blackout' : 'line' },
            })
          }
        />
      );
    default:
      return null;
  }
}

const styles = StyleSheet.create({
  group: {
    gap: spacing.xs,
  },
  readOnly: {
    gap: spacing.xs,
  },
  summaryLine: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.roadGray,
    lineHeight: 20,
  },
});
