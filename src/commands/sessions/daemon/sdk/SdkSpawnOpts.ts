export type SdkSpawnOpts = {
	prompt?: string;
	cwd?: string;
	sessionId?: string;
	claudeSessionId?: string;
	resumeId?: string;
	appendSystemPromptFile?: string;
	model?: string;
	launcherEnv?: Record<string, string>;
};
