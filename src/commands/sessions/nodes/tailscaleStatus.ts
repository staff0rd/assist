import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { detectPlatform } from "../../../lib/detectPlatform";

const execFileAsync = promisify(execFile);

const STATUS_TIMEOUT_MS = 10_000;

export type TailscalePeer = {
	DNSName?: string;
	Online?: boolean;
	TailscaleIPs?: string[];
};

export type TailscaleStatus = {
	BackendState?: string;
	MagicDNSSuffix?: string;
	CurrentTailnet?: {
		MagicDNSSuffix?: string;
		MagicDNSEnabled?: boolean;
	} | null;
	Self?: TailscalePeer;
	Peer?: Record<string, TailscalePeer> | null;
};

export function tailscaleCli(): string {
	return detectPlatform() === "wsl" ? "tailscale.exe" : "tailscale";
}

export async function tailscaleStatus(): Promise<TailscaleStatus> {
	const { stdout } = await execFileAsync(tailscaleCli(), ["status", "--json"], {
		encoding: "utf8",
		timeout: STATUS_TIMEOUT_MS,
		windowsHide: true,
	});
	return JSON.parse(stdout) as TailscaleStatus;
}
