import { Octokit } from '@octokit/rest';
import { z } from 'zod';
import { getInstallationTokenForRepo } from './github-app.js';

async function octokitForRepo(owner: string, repo: string) {
  const tokenInfo = await getInstallationTokenForRepo(owner, repo);
  const octokit = new Octokit({ auth: tokenInfo.token });
  return { octokit, tokenInfo };
}

const repoSchema = z.object({
  owner: z.string().min(1),
  repo: z.string().min(1)
});

export const createIssueSchema = repoSchema.extend({
  title: z.string().min(1),
  body: z.string().default(''),
  labels: z.array(z.string()).optional(),
  milestone: z.number().int().positive().optional()
});

export async function createIssue(input: z.infer<typeof createIssueSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.create({
    owner: input.owner,
    repo: input.repo,
    title: input.title,
    body: input.body,
    labels: input.labels,
    milestone: input.milestone
  });
  return response.data;
}

export const issueCommentSchema = repoSchema.extend({
  issue_number: z.number().int().positive(),
  body: z.string().min(1)
});

export async function createIssueComment(input: z.infer<typeof issueCommentSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.createComment({
    owner: input.owner,
    repo: input.repo,
    issue_number: input.issue_number,
    body: input.body
  });
  return response.data;
}

export const setLabelsSchema = repoSchema.extend({
  issue_number: z.number().int().positive(),
  labels: z.array(z.string())
});

export async function setIssueLabels(input: z.infer<typeof setLabelsSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.setLabels({
    owner: input.owner,
    repo: input.repo,
    issue_number: input.issue_number,
    labels: input.labels
  });
  return response.data;
}

export const updateMilestoneSchema = repoSchema.extend({
  issue_number: z.number().int().positive(),
  milestone: z.number().int().positive().nullable()
});

export async function updateIssueMilestone(input: z.infer<typeof updateMilestoneSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.update({
    owner: input.owner,
    repo: input.repo,
    issue_number: input.issue_number,
    milestone: input.milestone
  });
  return response.data;
}

export const updateIssueStateSchema = repoSchema.extend({
  issue_number: z.number().int().positive(),
  state: z.enum(['open', 'closed']),
  state_reason: z.enum(['completed', 'not_planned', 'reopened']).optional()
});

export async function updateIssueState(input: z.infer<typeof updateIssueStateSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.update({
    owner: input.owner,
    repo: input.repo,
    issue_number: input.issue_number,
    state: input.state,
    state_reason: input.state === 'closed' ? input.state_reason as 'completed' | 'not_planned' | undefined : undefined
  });
  return response.data;
}

export const createMilestoneSchema = repoSchema.extend({
  title: z.string().min(1),
  description: z.string().optional(),
  state: z.enum(['open', 'closed']).optional().default('open')
});

export async function createMilestone(input: z.infer<typeof createMilestoneSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.createMilestone({
    owner: input.owner,
    repo: input.repo,
    title: input.title,
    description: input.description,
    state: input.state
  });
  return response.data;
}

export const createLabelSchema = repoSchema.extend({
  name: z.string().min(1),
  color: z.string().regex(/^[0-9a-fA-F]{6}$/),
  description: z.string().optional()
});

export async function createLabel(input: z.infer<typeof createLabelSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.createLabel({
    owner: input.owner,
    repo: input.repo,
    name: input.name,
    color: input.color,
    description: input.description
  });
  return response.data;
}

export const listRepoLabelsSchema = repoSchema;
export async function listRepoLabels(input: z.infer<typeof listRepoLabelsSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.listLabelsForRepo({
    owner: input.owner,
    repo: input.repo,
    per_page: 100
  });
  return response.data;
}

export const listMilestonesSchema = repoSchema.extend({
  state: z.enum(['open', 'closed', 'all']).optional().default('open')
});

export async function listMilestones(input: z.infer<typeof listMilestonesSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.listMilestones({
    owner: input.owner,
    repo: input.repo,
    state: input.state,
    per_page: 100
  });
  return response.data;
}

export const pullCommentSchema = repoSchema.extend({
  pull_number: z.number().int().positive(),
  body: z.string().min(1)
});

export async function createPullComment(input: z.infer<typeof pullCommentSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.issues.createComment({
    owner: input.owner,
    repo: input.repo,
    issue_number: input.pull_number,
    body: input.body
  });
  return response.data;
}

export const pullReviewSchema = repoSchema.extend({
  pull_number: z.number().int().positive(),
  body: z.string().default(''),
  event: z.enum(['APPROVE', 'REQUEST_CHANGES', 'COMMENT'])
});

export async function createPullReview(input: z.infer<typeof pullReviewSchema>) {
  const { octokit } = await octokitForRepo(input.owner, input.repo);
  const response = await octokit.rest.pulls.createReview({
    owner: input.owner,
    repo: input.repo,
    pull_number: input.pull_number,
    body: input.body,
    event: input.event
  });
  return response.data;
}
