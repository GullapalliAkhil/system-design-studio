import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { T } from "./theme.js";
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
