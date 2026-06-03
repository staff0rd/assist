import { originDisplayName } from "./originDisplayName";

/**
 * Resolve a display label for each origin across the full set being listed.
 *
 * Remote origins normally show just their bare repo name (e.g. `repo`), but
 * when two or more remotes share the same repo name they fall back to the
 * disambiguating `org/repo` form. The decision is made across all listed
 * origins, so a name is only shortened when it is genuinely unique.
 *
 * Local origins (`local:/...`) always keep their bare final-segment label
 * regardless of collisions, matching {@link originDisplayName}.
 */
export function originDisplayLabels(origins: string[]): Map<string, string> {
	const isLocal = (origin: string): boolean => origin.startsWith("local:");

	// Bare repo name = the final segment of the resolved org/repo display name.
	const bareName = (origin: string): string => {
		const full = originDisplayName(origin);
		const segments = full.split("/");
		return segments[segments.length - 1] ?? full;
	};

	// Count how many distinct remote origins resolve to each bare repo name.
	const remoteCounts = new Map<string, number>();
	for (const origin of new Set(origins)) {
		if (isLocal(origin)) continue;
		const name = bareName(origin);
		remoteCounts.set(name, (remoteCounts.get(name) ?? 0) + 1);
	}

	const labels = new Map<string, string>();
	for (const origin of origins) {
		if (isLocal(origin)) {
			labels.set(origin, originDisplayName(origin));
			continue;
		}
		const name = bareName(origin);
		const collides = (remoteCounts.get(name) ?? 0) > 1;
		labels.set(origin, collides ? originDisplayName(origin) : name);
	}
	return labels;
}
