import { pickupsError } from "./pickupsError";
import { readProjectItems } from "./readProjectItems";
import { selectPickups } from "./selectPickups";
import type { NextPickup, NextSection } from "./types";

export async function fetchPickups(
	cwd: string,
	project: string | null,
	pickStatuses: string[],
): Promise<NextSection<NextPickup>> {
	if (!project) return { items: [], error: null };
	try {
		const { nodes, priorityOrder } = await readProjectItems(cwd, project);
		return {
			items: selectPickups(nodes, pickStatuses, priorityOrder),
			error: null,
		};
	} catch (error) {
		return { items: [], error: pickupsError(project, error) };
	}
}
