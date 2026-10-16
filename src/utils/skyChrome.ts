import { colors } from '../theme';

function hexChannel(hex: string, offset: number): number {
  return parseInt(hex.replace('#', '').slice(offset, offset + 2), 16);
}

export function skyLuminance(hex: string): number {
  const r = hexChannel(hex, 0);
  const g = hexChannel(hex, 2);
  const b = hexChannel(hex, 4);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

export function chromeForegroundForSky(sky: string): string {
  return skyLuminance(sky) < 0.45 ? colors.cream : colors.roadGray;
}

export function statusBarStyleForSky(sky: string): 'light' | 'dark' {
  return skyLuminance(sky) < 0.45 ? 'light' : 'dark';
}
