import { NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";

export const runtime = "nodejs";

const s3 = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Minimal CSV parser (quoted-field aware) -- matches the writer in ai-rank-lambda.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function csvToObjects(text) {
  const rows = parseCsv(text).filter((r) => r.length > 1 || (r.length === 1 && r[0] !== ""));
  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => {
    const obj = {};
    header.forEach((h, i) => (obj[h] = r[i]));
    return obj;
  });
}

async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf-8");
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tournament = searchParams.get("tournament");
  const year = searchParams.get("year");
  if (!tournament || !year) {
    return NextResponse.json({ error: "tournament and year are required" }, { status: 400 });
  }

  const safeName = `${tournament}_${year}`.replace(/\s+/g, "_");
  const key = `predictions/ai_ranked/${safeName}_ai_ranked.csv`;

  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    const csvText = await streamToString(obj.Body);
    const rows = csvToObjects(csvText);

    const players = rows.map((r) => ({
      player_name: r.player_name,
      original_rank: r.original_rank ? Number(r.original_rank) : null,
      ai_rank: Number(r.ai_rank),
      ai_score: r.ai_score !== "" ? Number(r.ai_score) : null,
      rationale: r.rationale,
    }));

    return NextResponse.json({ available: true, players });
  } catch (err) {
    if (err.name === "NoSuchKey") {
      return NextResponse.json({ available: false });
    }
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
