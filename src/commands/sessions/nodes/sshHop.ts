import type { SshTarget } from "../daemon/links/LinkStatus";
import { type DoctorProbes, failed, type Hop, passed } from "./DoctorProbes";

const REMEDIATIONS: [RegExp, (alias: string) => string][] = [
	[
		/connection refused/i,
		(alias) =>
			`Remote Login is off on ${alias} — on a Mac turn on System Settings → General → Sharing → Remote Login; on Windows run \`Start-Service sshd\` (OpenSSH Server)`,
	],
	[
		/could not resolve hostname/i,
		(alias) =>
			`no \`Host ${alias}\` in ~/.ssh/config and ${alias} does not resolve — add a Host entry with its HostName`,
	],
	[
		/host key verification failed/i,
		(alias) => `run \`ssh ${alias}\` once to accept its host key`,
	],
	[
		/agent refused operation|sign_and_send_pubkey/i,
		() => "1Password refused to sign — unlock it and approve the key request",
	],
	[
		/permission denied/i,
		(alias) =>
			`${alias} rejected every key offered — add this node's 1Password public key to ~/.ssh/authorized_keys on ${alias} (C:\\ProgramData\\ssh\\administrators_authorized_keys for a Windows administrator)`,
	],
	[
		/timed out/i,
		(alias) =>
			`${alias} did not answer on its ssh port — is it awake and on this network?`,
	],
];

export async function sshHop(
	ssh: SshTarget,
	probes: DoctorProbes,
): Promise<Hop> {
	const { code, stderr } = await probes.ssh(ssh.alias);
	if (code === 0) return passed("ssh", `ssh ${ssh.alias} authenticated`);
	const error = stderr || `ssh exited ${code}`;
	const match = REMEDIATIONS.find(([pattern]) => pattern.test(error));
	return failed(
		"ssh",
		error,
		match?.[1](ssh.alias) ??
			`run \`ssh -v ${ssh.alias}\` to see where it fails`,
	);
}
