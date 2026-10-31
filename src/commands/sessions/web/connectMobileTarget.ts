import { loadConfig } from "../../../shared/loadConfig";
import { readServeConfig } from "../nodes/readServeConfig";
import { tailnetHttpsPort } from "../nodes/tailnetHttpsPort";
import { tailscaleStatus } from "../nodes/tailscaleStatus";
import { resolveNodeName } from "../shared/resolveNodeName";
import type { ConnectMobileTarget } from "./connectMobile/ConnectMobileTarget";
import {
	type ConnectMobileDeps,
	RESTART,
	resolveTarget,
} from "./connectMobile/resolveTarget";

const defaultDeps: ConnectMobileDeps = {
	enabled: () => loadConfig().sessions?.tailscaleServe !== false,
	status: tailscaleStatus,
	serveStatus: readServeConfig,
	httpsPort: tailnetHttpsPort,
	nodeName: resolveNodeName,
};

export async function connectMobileTarget(
	port: number,
	deps: Partial<ConnectMobileDeps> = {},
): Promise<ConnectMobileTarget> {
	try {
		return await resolveTarget(port, { ...defaultDeps, ...deps });
	} catch (error) {
		return {
			ok: false,
			reason: error instanceof Error ? error.message : String(error),
			remediation: `Fix the above, ${RESTART}`,
		};
	}
}
