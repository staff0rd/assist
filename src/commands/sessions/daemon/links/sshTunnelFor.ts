import type { TunnelFactory } from "./LinkTunnel";
import { SshTunnel } from "./SshTunnel";

export const sshTunnelFor: TunnelFactory = (spec) =>
	spec.ssh ? new SshTunnel(spec.name, spec.ssh) : undefined;
