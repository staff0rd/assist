import { type Advisory, type Severity, severities } from "./severities";

export type AuditEvaluation = {
	failing: Advisory[];
	ignored: Advisory[];
	belowLevel: Advisory[];
};

function rank(severity: Severity): number {
	return severities.indexOf(severity);
}

export function evaluateAudit(
	advisories: Advisory[],
	level: Severity,
	ignore: string[],
): AuditEvaluation {
	const ignoreSet = new Set(ignore.map((id) => id.toUpperCase()));
	const result: AuditEvaluation = { failing: [], ignored: [], belowLevel: [] };
	const sorted = [...advisories].sort(
		(a, b) => rank(b.severity) - rank(a.severity),
	);
	for (const advisory of sorted) {
		if (ignoreSet.has(advisory.id.toUpperCase())) result.ignored.push(advisory);
		else if (rank(advisory.severity) >= rank(level))
			result.failing.push(advisory);
		else result.belowLevel.push(advisory);
	}
	return result;
}
