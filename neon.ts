import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  buckets: {
    receipts: { access: "private" },
  },
});
