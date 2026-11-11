import { refineItemId } from "../../../../../backlog/refineItemId";
import type { SessionInfo } from "../../types";

export function refinesItem(
	session: SessionInfo,
	itemId: number,
	{ cwd, node }: { cwd?: string; node?: string },
): boolean {
	return (
		refineItemId(session.assistArgs) === itemId &&
		session.node === node &&
		(!session.cwd || session.cwd === cwd)
	);
}
