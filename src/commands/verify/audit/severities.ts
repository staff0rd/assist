export const severities = [
	"info",
	"low",
	"moderate",
	"high",
	"critical",
] as const;

export type Severity = (typeof severities)[number];

export type Advisory = {
	id: string;
	packageName: string;
	severity: Severity;
	title: string;
	paths: string[];
	patched: string;
};
