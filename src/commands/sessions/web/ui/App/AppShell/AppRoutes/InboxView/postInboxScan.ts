import type { HarnessKind } from "../../../../../../../../shared/harnesses";
import { postJson } from "../../../postJson";

export async function postInboxScan(harness?: HarnessKind): Promise<void> {
	await postJson(
		"/api/inbox/scan",
		harness ? { harness } : {},
		"Failed to start inbox scan",
	);
}
