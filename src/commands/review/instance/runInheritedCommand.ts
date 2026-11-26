import { spawn } from "node:child_process";

export type RunCommand = (
	command: string,
	args: string[],
	options?: { cwd?: string; env?: Record<string, string> },
) => Promise<void>;

export const runInheritedCommand: RunCommand = (command, args, options = {}) =>
	new Promise((resolve, reject) => {
		const child = spawn(command, args, {
			cwd: options.cwd,
			env: { ...process.env, ...options.env },
			stdio: "inherit",
		});
		child.once("error", reject);
		child.once("close", (code, signal) => {
			if (code === 0) return resolve();
			const status = signal ? `signal ${signal}` : `exit code ${code}`;
			reject(new Error(`\`${command} ${args.join(" ")}\` failed (${status})`));
		});
	});
