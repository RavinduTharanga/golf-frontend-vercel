import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const doc = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.AI_RANKINGS_TABLE_NAME || "fairway-edge-ai-rankings";

function tournamentKey(tournament, year) {
  return `${tournament}_${year}`.toLowerCase().replace(/\s+/g, "_");
}

/**
 * Table schema: partition key "tournamentKey" (String), plus "tournament",
 * "year", "players" (the AI-reordered list), "generatedAt" (ISO string).
 */
export async function getAiRanking(tournament, year) {
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { tournamentKey: tournamentKey(tournament, year) },
    })
  );
  return result.Item || null;
}

export async function saveAiRanking(tournament, year, players) {
  const item = {
    tournamentKey: tournamentKey(tournament, year),
    tournament,
    year,
    players,
    generatedAt: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}
