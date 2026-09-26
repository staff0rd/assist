import type { SshTarget } from "./LinkStatus";

export function sshTunnelArgs({ alias, port, localPort }: SshTarget): string[] {
	return [
		"-N",
		"-o",
		"BatchMode=yes",
		"-o",
		"ExitOnForwardFailure=yes",
		"-o",
		"ServerAliveInterval=15",
		"-o",
		"ServerAliveCountMax=3",
		"-L",
		`${localPort}:127.0.0.1:${port}`,
		alias,
	];
}
