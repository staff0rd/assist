import { isProjectPath } from "../isProjectPath";

const PANE_ITEM = /^([\w.-]+)\|([\w.-]+)\|(\d+)$/;

export type ProjectPaneItem = { owner: string; repo: string; number: string };

export function projectPaneItem({
	pathname,
	search,
}: Pick<Location, "pathname" | "search">): ProjectPaneItem | undefined {
	if (!isProjectPath(pathname)) return undefined;
	const params = new URLSearchParams(search);
	if (params.get("pane") !== "issue") return undefined;
	const match = PANE_ITEM.exec(params.get("issue") ?? "");
	if (!match) return undefined;
	const [, owner, repo, number] = match;
	return { owner, repo, number };
}
