import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(8787),
  BIND_HOST: z.string().min(1).default('127.0.0.1'),
  GITHUB_APP_ID: z.string().min(1, 'GITHUB_APP_ID is required'),
  GITHUB_APP_PRIVATE_KEY_PATH: z.string().min(1, 'GITHUB_APP_PRIVATE_KEY_PATH is required'),
  GITHUB_APP_WEBHOOK_SECRET: z.string().optional().default('')
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const details = parsed.error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('\n');
  throw new Error(`Invalid environment:\n${details}`);
}

const privateKeyPath = path.resolve(parsed.data.GITHUB_APP_PRIVATE_KEY_PATH);
if (!fs.existsSync(privateKeyPath)) {
  throw new Error(`GitHub App private key file not found: ${privateKeyPath}`);
}

export const config = {
  port: parsed.data.PORT,
  bindHost: parsed.data.BIND_HOST,
  appId: parsed.data.GITHUB_APP_ID,
  privateKeyPath,
  privateKey: fs.readFileSync(privateKeyPath, 'utf8'),
  webhookSecret: parsed.data.GITHUB_APP_WEBHOOK_SECRET
};
