import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import type { AgentProbe } from "./DoctorProbes";

const PROBE_TIMEOUT_MS = 5_000;

export function parseIdentityAgent(
	sshConfig: string,
	env: NodeJS.ProcessEnv = process.env,
): string | undefined {
	const line = sshConfig
		.split(/\r?\n/)
		.find((l) => l.toLowerCase().startsWith("identityagent "));
	const value = line
		?.slice("identityagent ".length)
		.trim()
		.replace(/^"(.*)"$/, "$1");
	if (!value || value.toLowerCase() === "none") return undefined;
	if (value === "SSH_AUTH_SOCK" || value === "$SSH_AUTH_SOCK")
		return env.SSH_AUTH_SOCK;
	return value.replace(/^~(?=$|[/\\])/, homedir());
}

function configuredAgent(alias: string): string | undefined {
	const result = spawnSync("ssh", ["-G", alias], {
		encoding: "utf8",
		timeout: PROBE_TIMEOUT_MS,
		windowsHide: true,
	});
	return parseIdentityAgent(result.stdout ?? "") ?? process.env.SSH_AUTH_SOCK;
}

export async function probeSshAgent(alias: string): Promise<AgentProbe> {
	const socket = configuredAgent(alias);
	if (!socket && process.platform !== "win32") return { status: "missing" };
	const result = spawnSync("ssh-add", ["-l"], {
		encoding: "utf8",
		timeout: PROBE_TIMEOUT_MS,
		windowsHide: true,
		env: socket ? { ...process.env, SSH_AUTH_SOCK: socket } : process.env,
	});
	if (result.error)
		return { status: "unreachable", socket, error: result.error.message };
	if (result.status === 0)
		return {
			status: "ok",
			socket,
			keys: result.stdout.trim().split(/\r?\n/).length,
		};
	if (result.status === 1) return { status: "no-keys", socket };
	return {
		status: "unreachable",
		socket,
		error: result.stderr.trim() || `ssh-add exited ${result.status}`,
	};
}
