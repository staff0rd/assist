import { compareBoardOrder } from "./compareBoardOrder";
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
				boards.set(project, board);
				return selectPickups(nodes, filter, board);
			} catch (error) {
				throw new Error(projectErrorText(error));
			}
		},
		(a, b) =>
			projects.indexOf(a.project) - projects.indexOf(b.project) ||
			compareBoardOrder(a.boardOrder, b.boardOrder),
	);
	return {
		pickups,
		boards: projects.flatMap((project) => boards.get(project) ?? []),
	};
}
