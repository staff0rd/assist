import type { SessionProcess } from "../../../shared/harnessAdapters/types";
import type { SessionClient } from "./broadcast";
import { daemonLog } from "./daemonLog";
import { type Msg, routed } from "./routed";

type SdkHandle = NonNullable<SessionProcess["sdk"]>;

export function routedSdk(
	action: string,
	run: (sdk: SdkHandle, id: string, d: Msg, client: SessionClient) => void,
) {
	return routed((client, m, d) => {
		const id = String(d.sessionId);
		const session = m.session(id);
		const sdk = session?.pty?.sdk;
		if (!sdk) {
			daemonLog(
				`${action} ignored: session ${id} ${session ? "is not a Claude (SDK) session" : "was not found"}`,
			);
			return;
		}
		run(sdk, id, d, client);
	});
}
