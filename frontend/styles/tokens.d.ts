/** Type declarations for tokens.js (CommonJS) */

export declare const palette: {
  readonly white: string;
  readonly gray50: string;
  readonly gray100: string;
  readonly gray200: string;
  readonly gray300: string;
  readonly gray400: string;
  readonly gray500: string;
  readonly gray600: string;
  readonly gray700: string;
  readonly gray900: string;
  readonly slate300: string;
  readonly appBg: string;
  readonly blue50: string;
  readonly blue100: string;
  readonly blue200: string;
  readonly blue300: string;
  readonly blue600: string;
  readonly blue700: string;
  readonly red50: string;
  readonly red100: string;
  readonly red200: string;
  readonly red300: string;
  readonly red600: string;
  readonly red700: string;
  readonly red800: string;
  readonly fieldError: string;
  readonly green50: string;
  readonly green100: string;
  readonly green200: string;
  readonly green300: string;
  readonly green600: string;
  readonly green700: string;
  readonly green800: string;
  readonly amber100: string;
  readonly amber700: string;
  readonly amber800: string;
  readonly purple950: string;
  readonly purple900: string;
  readonly purple800: string;
  readonly purple700: string;
  readonly purple600: string;
  readonly purple500: string;
  readonly purple400: string;
  readonly purple300: string;
  readonly indigo400: string;
};

interface SemanticTokens {
  readonly bg: string;
  readonly surface: string;
  readonly cardBorder: string;
  readonly text: string;
  readonly muted: string;
  readonly scheduleLink: string;
  readonly prof: string;
  readonly schedDivider: string;
  readonly avatarBg: string;
  readonly greenBorderBg: string;
  readonly accentBar: string;
}

export declare const light: SemanticTokens;
export declare const dark: SemanticTokens;

export declare const base: {
  readonly appBg: string;
  readonly surface: string;
  readonly text: string;
  readonly muted: string;
  readonly border: string;
  readonly primary: string;
  readonly danger: string;
  readonly fieldError: string;
};

export declare const tailwind: Record<string, string>;
