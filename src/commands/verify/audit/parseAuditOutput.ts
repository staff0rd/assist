import { fromNpm, type NpmVulnerability } from "./fromNpm";
import { ghsaFromUrl } from "./ghsaFromUrl";
import type { Advisory, Severity } from "./severities";

type PnpmAdvisory = {
	module_name: string;
	severity: Severity;
	title: string;
	github_advisory_id?: string;
	url?: string;
	patched_versions: string;
	findings?: { paths?: string[] }[];
};

function fromPnpm(advisories: Record<string, PnpmAdvisory>): Advisory[] {
	return Object.values(advisories).map((a) => ({
		id: a.github_advisory_id ?? ghsaFromUrl(a.url) ?? a.url ?? "unknown",
		packageName: a.module_name,
		severity: a.severity,
		title: a.title,
		paths: (a.findings ?? []).flatMap((f) => f.paths ?? []),
		patched: a.patched_versions,
	}));
}

function isObject(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === "object";
}

export function parseAuditOutput(stdout: string): Advisory[] | undefined {
	let json: unknown;
	try {
		json = JSON.parse(stdout);
	} catch {
		return undefined;
	}
	if (!isObject(json) || "error" in json) return undefined;
	if (isObject(json.advisories))
		return fromPnpm(json.advisories as Record<string, PnpmAdvisory>);
	if (isObject(json.vulnerabilities) && "auditReportVersion" in json)
		return fromNpm(json.vulnerabilities as Record<string, NpmVulnerability>);
	return undefined;
}
