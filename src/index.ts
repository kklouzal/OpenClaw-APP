import express from 'express';
import { z } from 'zod';
import { config } from './config.js';
import { getInstallationTokenForRepo, listInstallations } from './github-app.js';
import {
  createIssue,
  createIssueComment,
  createIssueSchema,
  createMilestone,
  createMilestoneSchema,
  issueCommentSchema,
  listRepoLabels,
  listRepoLabelsSchema,
  setIssueLabels,
  setLabelsSchema,
  updateIssueMilestone,
  updateIssueState,
  updateIssueStateSchema,
  updateMilestoneSchema
} from './routes.js';

const app = express();
app.use(express.json());

app.get('/healthz', (_req, res) => {
  res.json({ ok: true, service: 'openclaw-app' });
});

app.get('/app', (_req, res) => {
  res.json({
    ok: true,
    appId: config.appId,
    privateKeyPath: config.privateKeyPath,
    mode: 'github-app-auth'
  });
});

app.get('/installations', async (_req, res, next) => {
  try {
    const installations = await listInstallations();
    res.json({ ok: true, installations });
  } catch (error) {
    next(error);
  }
});

const tokenRequestSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1)
});

app.post('/token', async (req, res, next) => {
  try {
    const body = tokenRequestSchema.parse(req.body);
    const tokenInfo = await getInstallationTokenForRepo(body.owner, body.repo);
    res.json({ ok: true, ...tokenInfo });
  } catch (error) {
    next(error);
  }
});

app.get('/labels', async (req, res, next) => {
  try {
    const body = listRepoLabelsSchema.parse(req.query);
    const labels = await listRepoLabels(body);
    res.json({ ok: true, labels });
  } catch (error) {
    next(error);
  }
});

app.post('/issues', async (req, res, next) => {
  try {
    const body = createIssueSchema.parse(req.body);
    const issue = await createIssue(body);
    res.json({ ok: true, issue });
  } catch (error) {
    next(error);
  }
});

app.post('/issues/comment', async (req, res, next) => {
  try {
    const body = issueCommentSchema.parse(req.body);
    const comment = await createIssueComment(body);
    res.json({ ok: true, comment });
  } catch (error) {
    next(error);
  }
});

app.put('/issues/labels', async (req, res, next) => {
  try {
    const body = setLabelsSchema.parse(req.body);
    const labels = await setIssueLabels(body);
    res.json({ ok: true, labels });
  } catch (error) {
    next(error);
  }
});

app.put('/issues/milestone', async (req, res, next) => {
  try {
    const body = updateMilestoneSchema.parse(req.body);
    const issue = await updateIssueMilestone(body);
    res.json({ ok: true, issue });
  } catch (error) {
    next(error);
  }
});

app.put('/issues/state', async (req, res, next) => {
  try {
    const body = updateIssueStateSchema.parse(req.body);
    const issue = await updateIssueState(body);
    res.json({ ok: true, issue });
  } catch (error) {
    next(error);
  }
});

app.post('/milestones', async (req, res, next) => {
  try {
    const body = createMilestoneSchema.parse(req.body);
    const milestone = await createMilestone(body);
    res.json({ ok: true, milestone });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'unknown error';
  res.status(500).json({ ok: false, error: message });
});

app.listen(config.port, () => {
  console.log(`OpenClaw-APP listening on http://127.0.0.1:${config.port}`);
});
