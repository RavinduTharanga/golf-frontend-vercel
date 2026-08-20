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
const TABLE_NAME = process.env.SUBSCRIPTIONS_TABLE_NAME || "golf-dashboard-subscriptions";

/**
 * Table schema: partition key "email" (String), plus "status"
 * ("active" | "canceled" | "past_due"), "stripeCustomerId",
 * "stripeSubscriptionId", "currentPeriodEnd" (ISO string), "updatedAt".
 */
export async function getSubscription(email) {
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { email: email.toLowerCase().trim() },
    })
  );
  return result.Item || null;
}

export async function isSubscriptionActive(email) {
  const sub = await getSubscription(email);
  return sub?.status === "active";
}

export async function upsertSubscription(email, fields) {
  const item = {
    email: email.toLowerCase().trim(),
    ...fields,
    updatedAt: new Date().toISOString(),
  };
  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return item;
}