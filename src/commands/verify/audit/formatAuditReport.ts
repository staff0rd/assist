import type { AuditEvaluation } from "./evaluateAudit";
import type { Advisory, Severity } from "./severities";

function describe(advisory: Advisory): string[] {
	return [
		`  ${advisory.severity.toUpperCase()} ${advisory.packageName} ${advisory.id} — ${advisory.title}`,
		...advisory.paths.map((p) => `    path: ${p}`),
		`    patched: ${advisory.patched}`,
	];
}

export function formatAuditReport(
	evaluation: AuditEvaluation,
	level: Severity,
): string[] {
	const lines: string[] = [];
	if (evaluation.ignored.length > 0) {
		lines.push("Ignored advisories (verify.audit.ignore):");
		for (const advisory of evaluation.ignored)
			lines.push(
				`  ${advisory.severity} ${advisory.packageName} ${advisory.id}`,
			);
		lines.push("");
	}
	if (evaluation.failing.length > 0) {
		lines.push(`Advisories at or above ${level}:`);
		for (const advisory of evaluation.failing)
			lines.push(...describe(advisory));
		lines.push("");
		lines.push(
			`Total: ${evaluation.failing.length} advisory(ies). Update the dependency, add a package manager override, or add the GHSA id to verify.audit.ignore when no fix exists upstream.`,
		);
		return lines;
	}
	const below = evaluation.belowLevel.length;
	lines.push(
		below > 0
			? `No advisories at or above ${level} (${below} below).`
			: "No advisories found.",
	);
	return lines;
}
