import type { browserApi } from "./browserApi";
import { isAssistHost } from "./isAssistHost";
import { pickTargetTab } from "./pickTargetTab";
import type { BrowserReply } from "./types";

type Api = NonNullable<ReturnType<typeof browserApi>>;

const ASSIST_HOSTS =
	"github.com, dev.azure.com, *.visualstudio.com, localhost, 127.0.0.1";

export async function resolveTargetTab(
	api: Api,
	url: string | undefined,
): Promise<{ id: number; url: string } | (BrowserReply & { ok: false })> {
	const [tabs, focused] = await Promise.all([
		api.tabs.query({}),
		api.windows?.getLastFocused().catch(() => undefined),
	]);
	const tab = pickTargetTab(tabs, focused?.id, url);
	if (!tab || tab.id === undefined)
		return {
			ok: false,
			error: url
				? `no open tab has a URL containing "${url}"`
				: "no active tab found",
		};
	if (!tab.url || !isAssistHost(tab.url))
		return {
			ok: false,
			tabUrl: tab.url,
			error: `the target tab is not on an assist host (${ASSIST_HOSTS})`,
		};
	return { id: tab.id, url: tab.url };
}
