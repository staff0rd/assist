import type { browserApi } from "./browserApi";
import type { BrowserReply } from "./types";

type Api = NonNullable<ReturnType<typeof browserApi>>;

export async function checkForUpdate(
	api: Api,
): Promise<BrowserReply<"update">> {
	if (!api.runtime.requestUpdateCheck)
		return { ok: false, error: "runtime.requestUpdateCheck is unavailable" };
	try {
		const { status, version } = await api.runtime.requestUpdateCheck();
		return {
			ok: true,
			result:
				status === "update_available" && version
					? { status, available: version }
					: { status },
		};
	} catch (error) {
		return {
			ok: false,
			error: `update check failed: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}
