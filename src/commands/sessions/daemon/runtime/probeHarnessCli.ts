import { execFile } from "node:child_process";
import { loginShellCommand } from "../../../../shared/nodeRuntime/loginShellCommand";
import { withHarnessPath } from "../../../../shared/nodeRuntime/withHarnessPath";

export type HarnessCliProbe = {
	name: string;
	path?: string;
	version?: string;
	error?: string;
};

const PROBE_TIMEOUT_MS = 15_000;

function run(file: string, args: string[]): Promise<string> {
	return new Promise((resolve, reject) => {
		execFile(
			file,
			args,
			{
				encoding: "utf8",
				timeout: PROBE_TIMEOUT_MS,
				windowsHide: true,
				env: withHarnessPath(process.env as Record<string, string>),
			},
			(error, stdout) => (error ? reject(error) : resolve(stdout)),
		);
	});
}

function probeCommand(name: string): [string, string[]] {
	if (process.platform === "win32")
		return ["cmd.exe", ["/c", `where ${name} && ${name} --version`]];
	return [
		process.env.SHELL ?? "bash",
		["-l", "-c", loginShellCommand(`command -v ${name} && ${name} --version`)],
	];
}

export async function probeHarnessCli(name: string): Promise<HarnessCliProbe> {
	try {
		const lines = (await run(...probeCommand(name)))
			.split(/\r?\n/)
			.map((line) => line.trim())
			.filter(Boolean);
		const pathIndex = lines.findIndex((line) => /^(\/|[A-Za-z]:\\)/.test(line));
		if (pathIndex === -1) return { name, error: "not found" };
		const rest = lines.slice(pathIndex + 1);
		const path = lines[pathIndex];
		const version = rest.find((line) => !/^(\/|[A-Za-z]:\\)/.test(line));
		return { name, path, version };
	} catch (error) {
		const timedOut = (error as { killed?: boolean }).killed === true;
		return {
			name,
			error: timedOut
				? `probe timed out after ${PROBE_TIMEOUT_MS / 1000}s`
				: "not found on PATH",
		};
	}
}
