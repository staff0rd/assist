import type { LinkSpec, LinkStatus } from "../daemon/links/LinkStatus";

export type PeerHealth = {
	nodeName?: string;
	version?: string;
	protocol?: number;
	daemon?: { reachable?: boolean };
	links?: LinkStatus[];
};

type HopName = "agent" | "ssh" | "tunnel" | "web" | "daemon" | "ws" | "link";

export type Hop = {
	hop: HopName;
	ok: boolean;
	detail?: string;
	error?: string;
	remediation?: string;
};

export type LinkDiagnosis = LinkSpec & { ok: boolean; hops: Hop[] };

type LocalLinkState = LinkStatus | "no-daemon" | "unknown-link";

export type AgentProbe =
	| { status: "ok"; socket?: string; keys: number }
	| { status: "missing" }
	| { status: "no-keys"; socket?: string }
	| { status: "unreachable"; socket?: string; error: string };

export type SshProbe = { code: number | null; stderr: string };

export type DoctorProbes = {
	health(url: string): Promise<PeerHealth>;
	hello(url: string): Promise<Record<string, unknown>>;
	linkState(name: string): LocalLinkState;
	sshAgent(alias: string): Promise<AgentProbe>;
	ssh(alias: string): Promise<SshProbe>;
	tunnel(localPort: number): Promise<boolean>;
};

export function passed(hop: HopName, detail: string): Hop {
	return { hop, ok: true, detail };
}

export function failed(hop: HopName, error: string, remediation: string): Hop {
	return { hop, ok: false, error, remediation };
}
