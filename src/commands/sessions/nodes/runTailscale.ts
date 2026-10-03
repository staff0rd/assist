import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { tailscaleCli } from "./tailscaleStatus";

const execFileAsync = promisify(execFile);

export async function runTailscale(args: string[]): Promise<string> {
	const { stdout } = await execFileAsync(tailscaleCli(), args, {
		encoding: "utf8",
		timeout: 10_000,
		windowsHide: true,
	});
	return stdout;
}
