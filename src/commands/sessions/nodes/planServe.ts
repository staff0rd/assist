import { tailnetSuffix } from "./tailnetSuffix";
import { type TailscaleStatus, tailscaleCli } from "./tailscaleStatus";

export type TailscaleServeConfig = {
	Web?: Record<
		string,
		{ Handlers?: Record<string, { Proxy?: string }> | null }
	> | null;
};

type ServePlan = {
	host: string;
	url: string;
	target: string;
	alreadyServing: boolean;
	args: string[];
};

export function planServe(
	status: TailscaleStatus,
	serveConfig: TailscaleServeConfig,
	port: number,
	httpsPort = port,
): ServePlan {
	tailnetSuffix(status);
	const fqdn = status.Self?.DNSName?.replace(/\.$/, "");
	if (!fqdn)
		throw new Error(
			`\`${tailscaleCli()} status --json\` reports no DNS name for this machine`,
		);
	const target = `http://127.0.0.1:${port}`;
	const served =
		serveConfig.Web?.[`${fqdn}:${httpsPort}`]?.Handlers?.["/"]?.Proxy;
	return {
		host: fqdn.split(".")[0],
		url: `https://${fqdn}:${httpsPort}`,
		target,
		alreadyServing: served?.replace(/\/$/, "") === target,
		args: ["serve", "--bg", `--https=${httpsPort}`, target],
	};
}
