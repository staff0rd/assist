import { originDisplayLabels } from "../commands/backlog/originDisplayLabels";
import { originDisplayName } from "../commands/backlog/originDisplayName";

export class AmbiguousRepoConfigError extends Error {
	override name = "AmbiguousRepoConfigError";
}

export function originKeyCandidates(origin: string): Set<string> {
	const displayName = originDisplayName(origin);
	const segments = displayName.split("/");
	const bare = segments[segments.length - 1] ?? displayName;
	return new Set([origin, displayName, bare]);
}

export function resolveRepoOverride(
	globalRaw: Record<string, unknown>,
	origin: string,
): Record<string, unknown> {
	const repos = globalRaw.repos;
	if (!repos || typeof repos !== "object" || Array.isArray(repos)) return {};

	const entries = repos as Record<string, unknown>;
	const candidates = originKeyCandidates(origin);
	const matches = Object.keys(entries).filter((key) => candidates.has(key));

	if (matches.length === 0) return {};
	if (matches.length > 1) {
		throw new AmbiguousRepoConfigError(
			`Ambiguous repos config in ~/.assist.yml: keys ${matches
				.map((m) => `"${m}"`)
				.join(", ")} all match the current repository (${origin}). ` +
				"Keep a single key per repository.",
		);
	}

	const override = entries[matches[0]];
	if (!override || typeof override !== "object" || Array.isArray(override))
		return {};
	return override as Record<string, unknown>;
}

export function resolveRepoWriteLabel(
	globalRaw: Record<string, unknown>,
	origin: string,
): string {
	const repos = globalRaw.repos;
	if (repos && typeof repos === "object" && !Array.isArray(repos)) {
		const candidates = originKeyCandidates(origin);
		const existing = Object.keys(repos as Record<string, unknown>).find((key) =>
			candidates.has(key),
		);
		if (existing) return existing;
	}
	return originDisplayLabels([origin]).get(origin) ?? origin;
}
