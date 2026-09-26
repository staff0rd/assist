import { formatItemId } from "../../formatItemId";
import { withCwd } from "./withCwd";

export function itemDetailPath(
	id: number,
	cwd?: string,
	node?: string,
): string {
	return withCwd(`/backlog/items/${formatItemId(id)}`, cwd, cwd && node);
}
