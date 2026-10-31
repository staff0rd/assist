import type { browserApi } from "./browserApi";
import type { BrowserReply } from "./types";

type Api = NonNullable<ReturnType<typeof browserApi>>;

const FLUSH_REPLY_MS = 1_000;

export function installAvailableUpdate(api: Api, reply: BrowserReply): void {
	if (!reply.ok || !("status" in reply.result)) return;
	if (reply.result.status !== "update_available") return;
	setTimeout(() => api.runtime.reload?.(), FLUSH_REPLY_MS);
}
