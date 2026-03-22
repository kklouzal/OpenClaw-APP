import { App } from '@octokit/app';
import { config } from './config.js';

export const githubApp = new App({
  appId: config.appId,
  privateKey: config.privateKey,
  webhooks: {
    secret: config.webhookSecret || 'unused'
  }
});

const appOctokit = githubApp.octokit as any;

export async function listInstallations() {
  const response = await appOctokit.request('GET /app/installations');
  return response.data.map((installation: any) => ({
    id: installation.id,
    accountLogin: installation.account?.login ?? null,
    targetType: installation.target_type,
    repositorySelection: installation.repository_selection,
    suspendedAt: installation.suspended_at
  }));
}

export async function getInstallationForRepo(owner: string, repo: string) {
  const response = await appOctokit.request('GET /repos/{owner}/{repo}/installation', {
    owner,
    repo
  });
  return response.data as any;
}

export async function getInstallationTokenForRepo(owner: string, repo: string) {
  const installation = await getInstallationForRepo(owner, repo);
  const installationOctokit = await githubApp.getInstallationOctokit(installation.id);
  const token = await (installationOctokit as any).auth({ type: 'installation' }) as any;
  return {
    installationId: installation.id,
    token: token.token,
    expiresAt: token.expiresAt,
    permissions: token.permissions,
    repositorySelection: installation.repository_selection
  };
}
