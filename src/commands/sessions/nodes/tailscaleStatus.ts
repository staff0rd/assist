import { execFile } from "node:child_process";
import { existsSync } from "node:fs";
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

const INSTALLED_CLI: Partial<
	Record<ReturnType<typeof detectPlatform>, string>
> = {
	wsl: "/mnt/c/Program Files/Tailscale/tailscale.exe",
	windows: "C:\\Program Files\\Tailscale\\tailscale.exe",
	macos: "/Applications/Tailscale.app/Contents/MacOS/Tailscale",
};

export function tailscaleCli(): string {
	const platform = detectPlatform();
	const installed = INSTALLED_CLI[platform];
	if (installed && existsSync(installed)) return installed;
	return platform === "wsl" ? "tailscale.exe" : "tailscale";
}

export async function tailscaleStatus(): Promise<TailscaleStatus> {
	const { stdout } = await execFileAsync(tailscaleCli(), ["status", "--json"], {
		encoding: "utf8",
		timeout: STATUS_TIMEOUT_MS,
		windowsHide: true,
	});
	return JSON.parse(stdout) as TailscaleStatus;
}
