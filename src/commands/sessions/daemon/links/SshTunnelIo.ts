import { type ChildProcess, spawn } from "node:child_process";
import { portAccepts } from "../../shared/portAccepts";

export type SshTunnelIo = {
	spawn: (args: string[]) => ChildProcess;
	accepts: (port: number) => Promise<boolean>;
	bindTimeoutMs: number;
	pollMs: number;
};

export const defaultSshTunnelIo: SshTunnelIo = {
	spawn: (args) =>
		spawn("ssh", args, {
			stdio: ["ignore", "ignore", "pipe"],
			windowsHide: true,
		}),
	accepts: (port) => portAccepts(port),
	bindTimeoutMs: 15_000,
	pollMs: 200,
};
