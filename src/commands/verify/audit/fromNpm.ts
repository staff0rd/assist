import { ghsaFromUrl } from "./ghsaFromUrl";
import type { Advisory, Severity } from "./severities";

type NpmVia = {
	name: string;
	title: string;
	url: string;
	severity: Severity;
	range: string;
};

export type NpmVulnerability = {
	name: string;
	via: (string | NpmVia)[];
	effects?: string[];
};

function npmPath(
	name: string,
	vulnerabilities: Record<string, NpmVulnerability>,
): string {
	const chain = [name];
	let current = vulnerabilities[name];
	while (current?.effects?.length) {
		const parent = current.effects[0];
		if (chain.includes(parent)) break;
		chain.unshift(parent);
		current = vulnerabilities[parent];
	}
	return chain.join(">");
}

export function fromNpm(
	vulnerabilities: Record<string, NpmVulnerability>,
): Advisory[] {
	const byId = new Map<string, Advisory>();
	for (const vuln of Object.values(vulnerabilities)) {
		for (const via of vuln.via) {
			if (typeof via === "string") continue;
			const id = ghsaFromUrl(via.url) ?? via.url;
			const path = npmPath(vuln.name, vulnerabilities);
			const existing = byId.get(id);
			if (existing) {
				if (!existing.paths.includes(path)) existing.paths.push(path);
				continue;
			}
			byId.set(id, {
				id,
				packageName: via.name,
				severity: via.severity,
				title: via.title,
				paths: [path],
				patched: `outside ${via.range}`,
			});
		}
	}
	return [...byId.values()];
}
