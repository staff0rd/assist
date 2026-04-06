import { isLockedByOther } from "./acquireLock";
import { isBlocked } from "./list/shared";
import type { BacklogFile, BacklogItem } from "./types";

export function findResumable(items: BacklogFile): BacklogItem | undefined {
	return items.find(
		(i) =>
			i.status === "in-progress" &&
			i.plan &&
			!isLockedByOther(i.id) &&
			!isBlocked(i, items),
	);
}
