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

export function matchRepoConfigKey(
	globalRaw: Record<string, unknown>,
	origin: string,
	source = "~/.assist.yml",
): string | undefined {
	const repos = globalRaw.repos;
	if (!repos || typeof repos !== "object" || Array.isArray(repos))
		return undefined;

	const entries = repos as Record<string, unknown>;
	const candidates = originKeyCandidates(origin);
	const matches = Object.keys(entries).filter((key) => candidates.has(key));

	if (matches.length === 0) return undefined;
	if (matches.length > 1) {
		throw new AmbiguousRepoConfigError(
			`Ambiguous repos config in ${source}: keys ${matches
				.map((m) => `"${m}"`)
				.join(", ")} all match the current repository (${origin}). ` +
				"Keep a single key per repository.",
		);
	}

	return matches[0];
}

export function resolveRepoOverride(
	globalRaw: Record<string, unknown>,
	origin: string,
	source?: string,
): Record<string, unknown> {
	const matched = matchRepoConfigKey(globalRaw, origin, source);
	if (matched === undefined) return {};

	const override = (globalRaw.repos as Record<string, unknown>)[matched];
	if (!override || typeof override !== "object" || Array.isArray(override))
		return {};
	return override as Record<string, unknown>;
}
