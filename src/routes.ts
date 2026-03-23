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
