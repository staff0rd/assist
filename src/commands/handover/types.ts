export type LoadInput = {
	session_id?: string;
	cwd?: string;
	hook_event_name?: string;
};

export type LoadContext = {
	additionalContext: string;
	systemMessage: string;
};

export type LoadOptions = {
	stdin?: () => Promise<string>;
	env?: NodeJS.ProcessEnv;
	cwdFallback?: string;
};

export type ResolvedOptions = {
	stdin: () => Promise<string>;
	env: NodeJS.ProcessEnv;
	cwdFallback: string;
};
