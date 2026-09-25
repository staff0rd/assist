import type { groupSessionsByRepo } from "./groupSessionsByRepo";
import type { SessionInfo } from "../../../../../types";

export function flattenSessionGroups(
	groups: ReturnType<typeof groupSessionsByRepo>,
): SessionInfo[] {
	return groups.flatMap((group) =>
		group.kind === "single"
			? [group.session]
			: group.rows.flatMap((row) => [row.session, ...row.children]),
	);
}
