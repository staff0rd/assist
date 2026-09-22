export type ReleaseEnvironmentState = {
	id: string;
	environment: string;
	label: string;
	sha: string | null;
	deployedAt: string | null;
	behind: number | null;
};

export type ReleaseStreamState = {
	name: string;
	repo: string;
	workflow: string;
	defaultBranch: string | null;
	environments: ReleaseEnvironmentState[];
	error?: string;
};
