import { execFile, spawnSync } from "node:child_process";
import { promisify } from "node:util";
import chalk from "chalk";
import { resolveNodeName } from "../shared/resolveNodeName";
import { parsePort } from "./parsePort";
import { planServe, type TailscaleServeConfig } from "./planServe";
import { tailscaleCli, tailscaleStatus } from "./tailscaleStatus";

const execFileAsync = promisify(execFile);

async function serveConfig(): Promise<TailscaleServeConfig> {
	const { stdout } = await execFileAsync(
		tailscaleCli(),
		["serve", "status", "--json"],
		{ encoding: "utf8", timeout: 10_000, windowsHide: true },
	);
	return stdout.trim() ? (JSON.parse(stdout) as TailscaleServeConfig) : {};
}

function runServe(args: string[]): void {
	console.log(chalk.dim(`${tailscaleCli()} ${args.join(" ")}`));
	const result = spawnSync(tailscaleCli(), args, { stdio: "inherit" });
	if (result.error) throw result.error;
	if (result.status !== 0)
		throw new Error(`tailscale serve exited with ${result.status}`);
}

export async function serveNode(options: { port: string }): Promise<void> {
	const port = parsePort("--port", options.port);
	const plan = planServe(await tailscaleStatus(), await serveConfig(), port);
	if (plan.alreadyServing) {
		console.log(chalk.dim(`${plan.url} already serves ${plan.target}`));
	} else {
		runServe(plan.args);
		console.log(chalk.green(`Serving ${plan.target} at ${plan.url}`));
	}
	console.log("Link this node from another node with:");
	console.log(
		`  assist sessions nodes link ${resolveNodeName()} --tailscale ${plan.host} --port ${port}`,
	);
}
