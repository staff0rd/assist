import { planServe, type TailscaleServeConfig } from "../../nodes/planServe";
import { runningStatus } from "../../nodes/runningStatus";
import {
	type TailscaleStatus,
	tailscaleCli,
} from "../../nodes/tailscaleStatus";
import type { ConnectMobileTarget } from "./ConnectMobileTarget";

export type ConnectMobileDeps = {
	enabled: () => boolean;
	status: () => Promise<TailscaleStatus>;
	serveStatus: () => Promise<TailscaleServeConfig>;
	httpsPort: (port: number) => number;
	nodeName: () => string;
};

export const RESTART = "then restart the web server so it runs tailscale serve";

export async function resolveTarget(
	port: number,
	deps: ConnectMobileDeps,
): Promise<ConnectMobileTarget> {
	if (!deps.enabled())
		return notServing(
			"sessions.tailscaleServe is false on this node",
			`Run \`assist config set sessions.tailscaleServe true --node\`, ${RESTART}`,
		);
	const current = await runningStatus(deps.status);
	if (typeof current === "string")
		return notServing(
			current.replace(/^skipped, /, ""),
			`Install Tailscale and run \`${tailscaleCli()} up\`, ${RESTART}`,
		);
	const plan = planServe(
		current,
		await deps.serveStatus(),
		port,
		deps.httpsPort(port),
	);
	if (!plan.alreadyServing)
		return notServing(
			`tailscale serve is not proxying ${plan.url} to ${plan.target}`,
			"Restart the web server, then check the `tailscale serve:` line in its log",
		);
	return { ok: true, url: plan.url, name: deps.nodeName() };
}

function notServing(reason: string, remediation: string): ConnectMobileTarget {
	return { ok: false, reason, remediation };
}
