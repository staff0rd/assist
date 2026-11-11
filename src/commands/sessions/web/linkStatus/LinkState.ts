export type LinkRef = { owner: string; repo: string; number: number };

export type LinkState =
	| "issue-open"
	| "issue-completed"
	| "issue-not-planned"
	| "pr-open"
	| "pr-draft"
	| "pr-merged"
	| "pr-closed";

export type LinkStates = Record<string, LinkState>;
