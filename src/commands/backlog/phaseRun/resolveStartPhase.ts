import type { Db } from "../../../shared/db/Db";
import { reconcileResumePhase } from "../reconcileResumePhase";
import type { BacklogItem } from "../types";
import { resumableSession } from "./resumableSession";

/** The phase a run starts from, and whether its resume session must be dropped because parallel phases moved past it. */
export async function resolveStartPhase(
	orm: Db,
	item: BacklogItem,
	resumeSessionId: string | undefined,
): Promise<{ startPhase: number; dropResume: boolean }> {
	const resume = await resumableSession(orm, item, resumeSessionId);
	const startPhase = await reconcileResumePhase(
		orm,
		item,
		(item.currentPhase ?? 1) - 1,
		resume,
	);
	return { startPhase, dropResume: !!resumeSessionId && !resume };
}
