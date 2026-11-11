import { Files } from "files-sdk";
import { neon } from "files-sdk/neon";

export const RECEIPTS_BUCKET = "receipts";

export function filesClient(bucket = RECEIPTS_BUCKET) {
  return new Files({ adapter: neon({ bucket }) });
}

export function storageConfigured() {
  return Boolean(
    process.env.AWS_ACCESS_KEY_ID &&
      process.env.AWS_SECRET_ACCESS_KEY &&
      process.env.AWS_ENDPOINT_URL_S3,
  );
}
