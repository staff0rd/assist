import { comparePickups } from "./comparePickups";
import { projectErrorText } from "./projectErrorText";
import { readProjectItems } from "./readProjectItems";
import { sectionAcross } from "./sectionAcross";
import { selectPickups } from "./selectPickups";
import type { NextBoard, NextPickup, NextSection, PickupFilter } from "./types";

type Pickups = { pickups: NextSection<NextPickup>; boards: NextBoard[] };

export async function fetchPickups(
	cwd: string,
	projects: string[],
	filter: PickupFilter,
): Promise<Pickups> {
	if (projects.length === 0)
		return { pickups: { items: [], error: null }, boards: [] };
	const boards = new Map<string, NextBoard>();
	const pickups = await sectionAcross(
		projects,
		async (project) => {
			try {
				const { nodes, board } = await readProjectItems(cwd, project);
				const { priorityOrder: _, ...link } = board;
				boards.set(project, link);
				return selectPickups(nodes, filter, board);
			} catch (error) {
				throw new Error(projectErrorText(error));
			}
		},
		comparePickups,
	);
	return {
		pickups,
		boards: projects.flatMap((project) => boards.get(project) ?? []),
	};
}
