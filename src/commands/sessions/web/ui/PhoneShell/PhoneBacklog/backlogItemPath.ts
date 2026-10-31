import { formatItemId } from "../../../../../backlog/formatItemId";

export type BacklogItemScope = { cwd?: string; node?: string };

export function backlogItemPath(
	itemId: number,
	scope: BacklogItemScope,
	page?: "description" | "criteria",
): string {
	const params = new URLSearchParams();
	if (scope.cwd) params.set("cwd", scope.cwd);
	if (scope.node) params.set("node", scope.node);
	const qs = params.toString();
	const path = `/backlog/${formatItemId(itemId)}${page ? `/${page}` : ""}`;
	return qs ? `${path}?${qs}` : path;
}
