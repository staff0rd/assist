import type { LinkSpec } from "./LinkStatus";

export function describeTarget({ url, ssh }: Pick<LinkSpec, "url" | "ssh">) {
	if (!ssh) return `direct ${url}`;
	return `ssh ${ssh.alias}:${ssh.port} via 127.0.0.1:${ssh.localPort}`;
}
