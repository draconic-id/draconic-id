import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h * 360, s * 100, l * 100];
}

export function getProfileColors(color: string): { backgroundColor: string; backgroundColorCard: string, backgroundColorMuted: string, textColor: string, textColorMuted: string } {
  const [h, s, l] = hexToHsl(color);
  const cardLightness = Math.min(l + 8, 100);
  const mutedLightness = Math.min(l + 15, 100);
  return {
    backgroundColor: color,
    backgroundColorCard: `hsl(${h}, ${Math.max(s - 10, 0)}%, ${cardLightness}%)`,
    backgroundColorMuted: `hsl(${h}, ${Math.max(s - 15, 0)}%, ${mutedLightness}%)`,
    textColor: cardLightness > 50 ? 'oklch(0.129 0.042 264.695)' : 'oklch(0.984 0.003 247.858)',
    textColorMuted: cardLightness > 50 ? 'oklch(0.279 0.041 260.031)' : 'oklch(0.704 0.04 256.788);'
  };
}