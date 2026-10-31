import { repoGroupCwd } from "../../repoGroupKey";
import type { SessionInfo } from "../../types";
import { backlogItemPath } from "../PhoneBacklog/backlogItemPath";

export function sessionItemPath(
	session: SessionInfo,
	localNode: string | undefined,
): string | undefined {
	const itemId =
		session.activity?.kind === "backlog" ? session.activity.itemId : undefined;
	if (itemId == null) return undefined;
	const node =
		session.node && session.node !== localNode ? session.node : undefined;
	return backlogItemPath(itemId, { cwd: repoGroupCwd(session), node });
}
