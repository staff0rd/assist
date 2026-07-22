import { recordSessionRefs } from "../../shared/db/recordSessionRefs";
import { resolveSessionItemId } from "../../shared/resolveSessionItemId";
import { readSessionPrRef } from "./readSessionPrRef";

export async function recordPrActivity(): Promise<void> {
	if (resolveSessionItemId() === null) return;
	const pr = readSessionPrRef();
	if (pr) await recordSessionRefs([pr]);
}
