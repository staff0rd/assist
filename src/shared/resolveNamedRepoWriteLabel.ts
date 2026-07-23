import {
	AmbiguousRepoConfigError,
	originKeyCandidates,
} from "./resolveRepoOverride";

export class UnknownRepoConfigError extends Error {
	override name = "UnknownRepoConfigError";
}

export function resolveNamedRepoWriteLabel(
	globalRaw: Record<string, unknown>,
	name: string,
): string {
	const repos = globalRaw.repos;
	const entries =
		repos && typeof repos === "object" && !Array.isArray(repos)
			? (repos as Record<string, unknown>)
			: {};
	const candidates = originKeyCandidates(name);
	const matches = Object.keys(entries).filter((key) => candidates.has(key));

	if (matches.length === 0) {
		throw new UnknownRepoConfigError(
			`No repo in ~/.assist.yml matches "${name}". ` +
				"Use an existing repos key (full origin, org/repo, or bare repo name).",
		);
	}
	if (matches.length > 1) {
		throw new AmbiguousRepoConfigError(
			`Ambiguous repos config in ~/.assist.yml: keys ${matches
				.map((m) => `"${m}"`)
				.join(", ")} all match "${name}". Keep a single key per repository.`,
		);
	}
	return matches[0];
}
