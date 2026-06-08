import type { BacklogItem } from "./types";
import { withCwd } from "./withCwd";

/**
 * Fetch a single item with its full relation graph (description, acceptance
 * criteria, plan, comments) on demand. The list only carries summary fields, so
 * the detail and edit views load the complete record here. Returns null when the
 * item no longer exists.
 */
export async function fetchItem(
	id: number,
	cwd?: string,
	signal?: AbortSignal,
): Promise<BacklogItem | null> {
	const res = await fetch(withCwd(`/api/items/${id}`, cwd), { signal });
	if (!res.ok) return null;
	return res.json();
}
