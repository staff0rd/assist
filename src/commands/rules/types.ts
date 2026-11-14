export type ScopedRule = {
	code: string;
	title?: string;
	text: string;
	source: string;
};

type RuleScopeKind = "user-db" | "user-node" | "repo-db" | "claude-md";

export type RuleScope = {
	id: string;
	kind: RuleScopeKind;
	name: string;
	label?: string;
	dir?: string;
	depth: number;
	rules: { code?: string; title?: string; text: string }[];
	error?: string;
};
