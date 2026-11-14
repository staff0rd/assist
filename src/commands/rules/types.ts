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

export type RuleEntry = RuleScope["rules"][number];

export type RuleChange =
	| {
			kind: "edit";
			scopeId: string;
			rule: RuleEntry;
			to: string;
			title?: string;
			text: string;
	  }
	| { kind: "delete"; scopeId: string; rule: RuleEntry };

export type PendingRuleChange = {
	id: string;
	change: RuleChange;
	code?: string;
};
