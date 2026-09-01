/* Pitch-black canvas with a radiant, high-chroma accent set — colours are
   chosen to glow against true black rather than to sit quietly on grey.
   Kept in one place so the canvas SVG and the chrome stay in sync;
   main.jsx mirrors every key onto :root as a CSS custom property. */
export const T = {
  canvas: "#000000",
  surface: "#07080c",
  surface2: "#0e1016",
  surface3: "#171a23",
  border: "#20242f",
  borderMuted: "#12151c",
  text: "#f4f7ff",
  textMuted: "#98a3c0",
  textFaint: "#606b88",

  accent: "#3d9bff",
  accentSubtle: "#3d9bff1f",

  green: "#00f5a0",
  red: "#ff4365",
  yellow: "#ffd23f",
  purple: "#b388ff",
  orange: "#ff9f45",
  pink: "#ff5fb0",
  cyan: "#00e5ff",

  grid: "#171b24",
};

/* Palette offered for edges, shapes and text. */
export const PALETTE = [
  T.textMuted,
  T.accent,
  T.green,
  T.yellow,
  T.red,
  T.purple,
  T.pink,
  T.cyan,
  T.orange,
];
