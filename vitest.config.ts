import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["keybinding-generator/*.test.mts"],
    globals: true,
  },
});
