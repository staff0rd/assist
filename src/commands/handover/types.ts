export type LoadInput = {
	session_id?: string;
	cwd?: string;
	hook_event_name?: string;
};

export type LoadContext = {
	additionalContext: string;
	systemMessage: string;
};

export type FindRecentFn = (
	cwd: string,
	excludeSessionId?: string,
) => string | undefined;

export type SummariseFn = (jsonlPath: string) => string;

export type LoadOptions = {
	stdin?: () => Promise<string>;
	env?: NodeJS.ProcessEnv;
	cwdFallback?: string;
	summariseFn?: SummariseFn;
	findRecentFn?: FindRecentFn;
};

export type ResolvedOptions = {
	stdin: () => Promise<string>;
	env: NodeJS.ProcessEnv;
	cwdFallback: string;
	summariseFn: SummariseFn;
	findRecentFn: FindRecentFn;
};
