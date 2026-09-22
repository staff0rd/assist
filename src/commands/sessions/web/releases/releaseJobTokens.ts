import type { ReleaseNode } from "../../../../shared/types";

export function normaliseJobName(text: string): string {
	return ` ${text
		.toLowerCase()
		.replaceAll(/[^a-z0-9]+/g, " ")
		.trim()} `;
}

export function releaseJobTokens(node: ReleaseNode): string[] {
	const candidates = [node.environment, node.label, node.id].filter(
		(value): value is string => Boolean(value),
	);
	return [...new Set(candidates.map(normaliseJobName))]
		.filter((token) => token.trim().length > 0)
		.sort((a, b) => b.length - a.length);
}
