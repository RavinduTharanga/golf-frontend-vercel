import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getAiRanking, saveAiRanking } from "@/lib/aiRankings";

export const runtime = "nodejs";
// Web search can take a while across 10 players -- give the function room
// beyond Vercel's default timeout.
export const maxDuration = 60;

const client = new Anthropic();

function buildPrompt(tournament, year, rows) {
  const playerList = rows
    .map((r) => `${r.rank}. ${r.player_name} - model probability ${(r.p * 100).toFixed(1)}%`)
    .join("\n");

  return `You are analyzing the field for the ${tournament} (${year}) PGA Tour event.

Here are our model's top-10 picks to finish in the top 10, ranked by the model's own probability estimate:

${playerList}

Research each player using web search: recent form/news, any injury or withdrawal reports, how their game fits this course, and the weather forecast for tournament week if relevant. Then re-rank these same 10 players (do not add or remove anyone) based on your combined judgment of the model's number plus what you find.

Respond with ONLY a JSON object in this exact shape, no other text before or after:
{"players":[{"player_name":"<same as input>","ai_rank":<1-10>,"ai_score":<0-1 float>,"rationale":"<1-2 sentence reason>"}]}`;
}

function extractJson(text) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON found in AI response");
  return JSON.parse(match[0]);
}

async function runAiRanking(tournament, year, rows) {
  const tools = [{ type: "web_search_20260209", name: "web_search", max_uses: 20 }];
  const messages = [{ role: "user", content: buildPrompt(tournament, year, rows) }];

  let finalMessage;
  // A long agentic web-search turn can pause; resume until it actually finishes.
  for (let i = 0; i < 5; i++) {
    const stream = client.messages.stream({
      model: "claude-sonnet-5",
      max_tokens: 16000,
      thinking: { type: "adaptive" },
      output_config: { effort: "high" },
      tools,
      messages,
    });
    finalMessage = await stream.finalMessage();

    if (finalMessage.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: finalMessage.content });
      continue;
    }
    break;
  }

  const textBlock = finalMessage.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("AI response had no text content");

  const parsed = extractJson(textBlock.text);

  const originalByName = {};
  for (const r of rows) originalByName[r.player_name] = r.rank;

  return parsed.players.map((p) => ({
    player_name: p.player_name,
    original_rank: originalByName[p.player_name] ?? null,
    ai_rank: p.ai_rank,
    ai_score: p.ai_score,
    rationale: p.rationale,
  }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const tournament = searchParams.get("tournament");
  const year = searchParams.get("year");
  if (!tournament || !year) {
    return NextResponse.json({ error: "tournament and year are required" }, { status: 400 });
  }

  try {
    const cached = await getAiRanking(tournament, year);
    if (cached) {
      return NextResponse.json({ cached: true, players: cached.players, generatedAt: cached.generatedAt });
    }
    return NextResponse.json({ cached: false });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { tournament, year, rows } = await request.json();
    if (!tournament || !year || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "tournament, year, and rows are required" }, { status: 400 });
    }

    const cached = await getAiRanking(tournament, year);
    if (cached) {
      return NextResponse.json({ cached: true, players: cached.players, generatedAt: cached.generatedAt });
    }

    const players = await runAiRanking(tournament, year, rows);
    const saved = await saveAiRanking(tournament, year, players);

    return NextResponse.json({ cached: false, players: saved.players, generatedAt: saved.generatedAt });
  } catch (err) {
    return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
  }
}
