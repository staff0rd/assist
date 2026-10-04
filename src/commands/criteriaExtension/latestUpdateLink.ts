import { latestUpdate } from "./latestUpdate";

export function latestUpdateLink(
	manifest: string,
	updates: string,
): string | undefined {
	return latestUpdate(manifest, updates)?.update_link;
}
