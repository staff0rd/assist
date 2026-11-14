export type RulePlanContext = {
	root: string;
	cwd: string;
	globalConfigPath: string;
};

export type RuleWrite = () => Promise<string | undefined>;

export type RuleWritePlan =
	| { ok: true; write: RuleWrite; code?: string }
	| { ok: false; error: string };
