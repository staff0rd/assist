import { spawn } from "node:child_process";
import type { SshProbe } from "./DoctorProbes";

const PROBE_TIMEOUT_MS = 15_000;

export function probeSsh(alias: string): Promise<SshProbe> {
	return new Promise((resolve) => {
		const child = spawn(
			"ssh",
			["-o", "BatchMode=yes", "-o", "ConnectTimeout=5", alias, "exit"],
			{ stdio: ["ignore", "ignore", "pipe"], windowsHide: true },
		);
		let stderr = "";
		child.stderr.on("data", (chunk) => {
			stderr += chunk;
		});
		const timer = setTimeout(() => child.kill(), PROBE_TIMEOUT_MS);
		child.once("error", (error) => {
			clearTimeout(timer);
			resolve({ code: null, stderr: error.message });
		});
		child.once("close", (code) => {
			clearTimeout(timer);
			resolve({ code, stderr: stderr.trim() });
		});
	});
}
