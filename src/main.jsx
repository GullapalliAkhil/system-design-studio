import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { T } from "./theme.js";

/* Self-hosted variable fonts — no CDN, so the app still looks right offline.
   Space Grotesk carries the UI; JetBrains Mono handles numerals and keycaps. */
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./styles.css";

/* theme.js stays the single source of truth: mirror the tokens onto :root so
   plain CSS can use them without importing JS. */
for (const [name, value] of Object.entries(T)) {
  document.documentElement.style.setProperty(`--${name}`, value);
}

/* Deliberately no <StrictMode>: useDoc() writes its history refs from inside a
   setState updater, which StrictMode's double-invoke would turn into duplicate
   undo entries in dev. See the note in README. */
createRoot(document.getElementById("root")).render(<App />);
