import { loadConfig } from "../../../shared/loadConfig";
import { planServe, type TailscaleServeConfig } from "./planServe";
import { type TailscaleStatus, tailscaleStatus } from "./tailscaleStatus";
import { runningStatus } from "./runningStatus";
import { runTailscale } from "./runTailscale";
import { tailnetHttpsPort } from "./tailnetHttpsPort";

const SERVE_WRITE_ATTEMPTS = 5;

type ServeDeps = {
	enabled: () => boolean;
	status: () => Promise<TailscaleStatus>;
	serveStatus: () => Promise<TailscaleServeConfig>;
	serve: (args: string[]) => Promise<void>;
	sleep: (ms: number) => Promise<void>;
	httpsPort: (port: number) => number;
};
const defaultDeps: ServeDeps = {
	enabled: () => loadConfig().sessions?.tailscaleServe !== false,
	status: tailscaleStatus,
	serveStatus: async () => {
		const stdout = (await runTailscale(["serve", "status", "--json"])).trim();
		return stdout ? (JSON.parse(stdout) as TailscaleServeConfig) : {};
	},
	serve: async (args) => {
		await runTailscale(args);
	},
	sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
	httpsPort: tailnetHttpsPort,
};

export async function ensureTailscaleServe(
	port: number,
	deps: Partial<ServeDeps> = {},
): Promise<string> {
	const { enabled, status, serveStatus, serve, sleep, httpsPort } = {
		...defaultDeps,
		...deps,
	};
	if (!enabled()) return "skipped, sessions.tailscaleServe is false";
	const current = await runningStatus(status);
	if (typeof current === "string") return current;
	for (let attempt = 1; ; attempt++) {
		const plan = planServe(current, await serveStatus(), port, httpsPort(port));
		if (plan.alreadyServing) return `${plan.url} already serves ${plan.target}`;
		try {
			await serve(plan.args);
			return `serving ${plan.target} at ${plan.url}`;
		} catch (error) {
			if (attempt >= SERVE_WRITE_ATTEMPTS) throw error;
			await sleep(attempt * 500 + Math.random() * 500);
		}
	}
}
