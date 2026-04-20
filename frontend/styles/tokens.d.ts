/** Type declarations for tokens.js (CommonJS) */

export declare const palette: {
  readonly white: string;
  readonly black: string;
  readonly gray50: string;
  readonly gray100: string;
  readonly gray200: string;
  readonly gray300: string;
  readonly gray400: string;
  readonly gray500: string;
  readonly gray600: string;
  readonly gray700: string;
  readonly gray900: string;
  readonly grayNeutral: string;
  readonly slate200: string;
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
  readonly red500: string;
  readonly red600: string;
  readonly red700: string;
  readonly red800: string;
  readonly fieldError: string;
  readonly green50: string;
  readonly green100: string;
  readonly green200: string;
  readonly green300: string;
  readonly green500: string;
  readonly green600: string;
  readonly green700: string;
  readonly green800: string;
  readonly amber100: string;
  readonly amber700: string;
  readonly amber800: string;
  readonly yellow400: string;
  readonly purple50: string;
  readonly purple950: string;
  readonly purple900: string;
  readonly purple800: string;
  readonly purple700: string;
  readonly purple600: string;
  readonly purple500: string;
  readonly purple400: string;
  readonly purple300: string;
  readonly indigo400: string;
  readonly magenta600: string;
  readonly pink600: string;
  readonly rose600: string;
};

interface SemanticTokens {
  // Backgrounds
  readonly bg: string;
  readonly surface: string;
  readonly cardBorder: string;
  // Text
  readonly text: string;
  readonly muted: string;
  // Schedule-specific
  readonly scheduleLink: string;
  readonly prof: string;
  readonly schedDivider: string;
  readonly avatarBg: string;
  readonly greenBorderBg: string;
  readonly accentBar: string;
  // New semantic tokens
  readonly online: string;
  readonly divider: string;
  readonly inputBorder: string;
  readonly inputBorderFocus: string;
  readonly skeleton: string;
  readonly shadow: string;
  readonly error: string;
  readonly warningIcon: string;
  // Glassmorphism
  readonly glassLight: string;
  readonly glassBorder: string;
  readonly glassOverlay: string;
  readonly overlayLight: string;
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

export declare const type: {
  readonly xs:    { readonly size: number; readonly leading: number };
  readonly sm:    { readonly size: number; readonly leading: number };
  readonly base:  { readonly size: number; readonly leading: number };
  readonly md:    { readonly size: number; readonly leading: number };
  readonly lg:    { readonly size: number; readonly leading: number };
  readonly xl:    { readonly size: number; readonly leading: number };
  readonly "2xl": { readonly size: number; readonly leading: number };
};

export declare const radius: {
  readonly sm:   number;
  readonly md:   number;
  readonly lg:   number;
  readonly xl:   number;
  readonly full: number;
};

export declare const space: {
  readonly 1:  number;
  readonly 2:  number;
  readonly 3:  number;
  readonly 4:  number;
  readonly 5:  number;
  readonly 6:  number;
  readonly 8:  number;
  readonly 10: number;
  readonly 12: number;
  readonly 16: number;
};

export declare const gradients: {
  readonly brand:       readonly [string, string, string];
  readonly primary:     readonly [string, string];
  readonly primaryDark: readonly [string, string];
  readonly danger:      readonly [string, string];
  readonly card:        readonly [string, string];
};

export declare const motion: {
  readonly fast:   number;
  readonly normal: number;
  readonly slow:   number;
  readonly slower: number;
};

export declare const tailwind: Record<string, string>;
