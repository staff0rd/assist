import { comparePickups } from "./comparePickups";
import { projectErrorText } from "./projectErrorText";
import { readProjectItems } from "./readProjectItems";
import { sectionAcross } from "./sectionAcross";
import { selectPickups } from "./selectPickups";
import type { NextPickup, NextSection } from "./types";

async function loadPickups(
	cwd: string,
	project: string,
	pickStatuses: string[],
): Promise<NextPickup[]> {
	try {
		const { nodes, board } = await readProjectItems(cwd, project);
		return selectPickups(nodes, pickStatuses, board);
	} catch (error) {
		throw new Error(projectErrorText(error));
	}
}

export async function fetchPickups(
	cwd: string,
	projects: string[],
	pickStatuses: string[],
): Promise<NextSection<NextPickup>> {
	if (projects.length === 0) return { items: [], error: null };
	return sectionAcross(
		projects,
		(project) => loadPickups(cwd, project, pickStatuses),
		comparePickups,
	);
}
