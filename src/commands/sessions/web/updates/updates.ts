import type { IncomingMessage, ServerResponse } from "node:http";
import { getInstallDir } from "../../../../shared/getInstallDir";
import { respondJson } from "../../../../shared/web";
import { ASSIST_VERSION } from "../../daemon/buildHello";
import type { NodeUpdateStatus } from "../../shared/NodeUpdateStatus";
import { resolveNodeName } from "../../shared/resolveNodeName";
import { extensionUpdateStatus } from "../../../extension/extensionUpdateStatus";
import { browserLink } from "../browser/browserLink";
import { autoRestartEnabled } from "./autoRestartEnabled";
import { autoRestartWait } from "./autoRestart/autoRestartWait";
import { latestSignedExtension } from "./latestSignedExtension";
import { readRestartState } from "./readRestartState";
import { readUpdateHistory } from "./readUpdateHistory";

export async function updates(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const installDir = getInstallDir();
	const { reply, built, buildPending, restart } =
		await readRestartState(installDir);
	const status: NodeUpdateStatus = {
		nodeName: resolveNodeName(),
		installDir,
		running: reply?.version ?? ASSIST_VERSION,
		built,
		buildPending,
		restart,
		autoRestart: autoRestartEnabled(installDir),
		autoRestartWait: autoRestartWait.get(),
		daemonReachable: reply !== undefined,
		loop: reply?.loop ?? {
			phase: "off",
			since: new Date().toISOString(),
			reason: "daemon not reachable",
		},
		history: readUpdateHistory(installDir),
		extension: extensionUpdateStatus(
			browserLink.connectedVersion(),
			await latestSignedExtension(),
		),
	};
	respondJson(res, 200, status);
}
