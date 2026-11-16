import { isLockedByOther } from "./acquireLock";
import { isBlocked } from "./list/shared";
import type { BacklogFile, BacklogItem } from "./types";

export function findResumable(items: BacklogFile): BacklogItem | undefined {
	return items.find(
		(i) =>
			i.status === "in-progress" &&
			i.plan &&
			// why: a run parked on parallel phases holds no lock; the daemon wakes it once they end.
			!i.runningPhases?.length &&
			!isLockedByOther(i.id) &&
			!isBlocked(i, items),
	);
}
