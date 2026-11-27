export type CompanionHead = { sha: string; fetchRef: string; source: string };

export type CompanionLookup = {
	remoteRepo: (repoRoot: string) => { org: string; repo: string } | null;
	prHead: (prNumber: number, repo: { org: string; repo: string }) => string;
	remoteHead: (repoRoot: string) => string;
};
