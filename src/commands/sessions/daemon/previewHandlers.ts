import { handleClosePreviews } from "./handleClosePreviews";
import { handleDeferCommand } from "./handleDeferCommand";
import { handleReopenHighLevelReview } from "./handleReopenHighLevelReview";
import { type Handler, routed } from "./routed";

export const previewHandlers: Record<string, Handler> = {
	"pr-preview": (client, m, d) => m.prPreview.set(client, d),
	"defer-command": handleDeferCommand,
	"reopen-high-level-review": handleReopenHighLevelReview,
	"close-previews": handleClosePreviews,
	"pr-decision": routed((_client, m, d) => m.prPreview.decide(d)),
};
