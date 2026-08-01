import { S3Client, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import Papa from "papaparse";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.S3_BUCKET;

// Canonical column name -> list of possible source names, in priority
// order. Same idea as the Streamlit dashboard's COLUMN_CANDIDATES --
// handles naming drift across pipeline versions (cum_rank vs r1_rank,
// p_top10 vs p, etc.) without needing to know exactly which version
// wrote a given file.
const COLUMN_CANDIDATES = {
  rank: ["rank", "cum_rank", "r1_rank"],
  p: ["p", "p_top10"],
  cum_sg_total: ["cum_sg_total", "r1_sg_total"],
  cum_strokes_back: ["cum_strokes_back", "r1_strokes_back"],
};

function normalizeRow(row) {
  const out = { ...row };
  for (const [canonical, candidates] of Object.entries(COLUMN_CANDIDATES)) {
    if (out[canonical] !== undefined) continue;
    for (const candidate of candidates) {
      if (out[candidate] !== undefined) {
        out[canonical] = out[candidate];
        break;
      }
    }
  }
  return out;
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf-8");
}

/**
 * Lists everything under an S3 prefix, filters with `matcher`, and
 * returns the key with the most recent LastModified timestamp -- same
 * "auto-discover the latest file" pattern as the ECS pipeline.
 */
export async function findLatestKey(prefix, matcher) {
  const list = await s3.send(
    new ListObjectsV2Command({ Bucket: BUCKET, Prefix: prefix })
  );
  const candidates = (list.Contents || []).filter((obj) => matcher(obj.Key));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => new Date(b.LastModified) - new Date(a.LastModified));
  return candidates[0].Key;
}

/**
 * Downloads a CSV from S3 and parses it into an array of row objects,
 * with column names normalized to the canonical set the frontend expects.
 */
export async function fetchCsvAsRows(key) {
  const obj = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: key }));
  const text = await streamToString(obj.Body);
  const parsed = Papa.parse(text, { header: true, dynamicTyping: true, skipEmptyLines: true });
  return parsed.data.map(normalizeRow);
}

export const CHECKPOINT_CONFIG = {
  "Pre-Tournament": {
    prefix: "predictions/",
    matcher: (key) =>
      key.endsWith("_predictions.csv") && !["_r1_", "_r2_", "_r3_"].some((tag) => key.includes(tag)),
  },
  "After Round 1": {
    prefix: "results_post_r1/",
    matcher: (key) => key.endsWith("_top10_predictions.csv"),
  },
  "After Round 2": {
    prefix: "results_post_r2/",
    matcher: (key) => key.endsWith("_top10_predictions.csv"),
  },
  "After Round 3": {
    prefix: "results_post_r3/",
    matcher: (key) => key.endsWith("_top10_predictions.csv"),
  },
};
