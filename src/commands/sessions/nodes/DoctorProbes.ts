import type { LinkSpec, LinkStatus } from "../daemon/links/LinkStatus";
import type { NodeRuntimeReport } from "../daemon/runtime/NodeRuntimeReport";
import type { TailscaleStatus } from "./tailscaleStatus";

export type PeerHealth = {
	nodeName?: string;
	version?: string;
	protocol?: number;
	daemon?: { reachable?: boolean; runtime?: NodeRuntimeReport };
	links?: LinkStatus[];
};

type HopName = "tailscale" | "web" | "daemon" | "ws" | "link";

export type Hop = {
	hop: HopName;
	ok: boolean;
	detail?: string;
	error?: string;
	remediation?: string;
};

export type LinkDiagnosis = LinkSpec & {
	ok: boolean;
	hops: Hop[];
	runtime?: NodeRuntimeReport;
};

type LocalLinkState = LinkStatus | "no-daemon" | "unknown-link";

export type DoctorProbes = {
	health(url: string): Promise<PeerHealth>;
	hello(url: string): Promise<Record<string, unknown>>;
	linkState(name: string): LocalLinkState;
	tailscale(): Promise<TailscaleStatus>;
};

export function passed(hop: HopName, detail: string): Hop {
	return { hop, ok: true, detail };
}

export function failed(hop: HopName, error: string, remediation: string): Hop {
	return { hop, ok: false, error, remediation };
}
