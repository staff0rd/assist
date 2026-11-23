import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { readSessionPrRef } from "./readSessionPrRef";
import type { BaseRepoMode } from "./resolveBaseRepo";

export async function recordPrActivity(baseRepo?: BaseRepoMode): Promise<void> {
	if (resolveSessionItemId() === null) return;
	const pr = readSessionPrRef(baseRepo);
	if (pr) await recordSessionRefs([pr]);
}
