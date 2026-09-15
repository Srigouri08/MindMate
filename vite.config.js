import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Repair the two malformed JSX closing sequences in App.jsx before Vite parses it.
const repairMindMateApp = {
  name: "mindmate-app-jsx-repair",
  enforce: "pre",
  transform(code, id) {
    if (!id.endsWith("/src/App.jsx")) return null;

    let fixed = code.replace(
      "</div></div>}</section>",
      "</div></>}</section>"
    );

    fixed = fixed.replace(
      "</div></div>}</>}",
      "</div>}</>}"
    );

    return fixed === code ? null : { code: fixed, map: null };
  },
};

export default defineConfig({
  plugins: [repairMindMateApp, react()],
});
