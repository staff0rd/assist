import type { ParsedFinding } from "./parseFindings";

export type LineBoundFinding = ParsedFinding & {
	file: string;
	line: number;
	startLine?: number;
};

function isValidLine(n: number): boolean {
	return Number.isInteger(n) && n >= 1;
}

function toLineBound(finding: ParsedFinding): LineBoundFinding | null {
	if (!finding.location || finding.location.toLowerCase() === "n/a") {
		return null;
	}
	const match = finding.location.match(/^(.+):(\d+)(?:-(\d+))?$/);
	if (!match) return null;
	const startLine = Number.parseInt(match[2], 10);
	const endLine = match[3] ? Number.parseInt(match[3], 10) : startLine;
	if (!isValidLine(startLine) || !isValidLine(endLine)) return null;
	if (endLine < startLine) return null;
	const base = { ...finding, file: match[1], line: endLine };
	return startLine === endLine ? base : { ...base, startLine };
}

export function partitionFindings(findings: ParsedFinding[]): {
	lineBound: LineBoundFinding[];
	unlocated: ParsedFinding[];
	alreadyRaised: ParsedFinding[];
} {
	const lineBound: LineBoundFinding[] = [];
	const unlocated: ParsedFinding[] = [];
	const alreadyRaised: ParsedFinding[] = [];
	for (const finding of findings) {
		if (finding.source === "already-raised") {
			alreadyRaised.push(finding);
			continue;
		}
		const bound = toLineBound(finding);
		if (bound) lineBound.push(bound);
		else unlocated.push(finding);
	}
	return { lineBound, unlocated, alreadyRaised };
}
