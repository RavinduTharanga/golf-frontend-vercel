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
const TABLE_NAME = process.env.USERS_TABLE_NAME || "golf-dashboard-users";

/**
 * Looks up a user by email. Returns null if not found.
 * Table schema: partition key "email" (String), plus "passwordHash",
 * "createdAt".
 */
export async function getUserByEmail(email) {
  const result = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { email: email.toLowerCase().trim() },
    })
  );
  return result.Item || null;
}

/**
 * Creates a new user. Throws if the email already exists (uses a
 * conditional write so two simultaneous signups can't race each other
 * into overwriting one another).
 */
export async function createUser(email, passwordHash) {
  const normalizedEmail = email.toLowerCase().trim();
  await doc.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        email: normalizedEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      ConditionExpression: "attribute_not_exists(email)",
    })
  );
  return { email: normalizedEmail };
}
