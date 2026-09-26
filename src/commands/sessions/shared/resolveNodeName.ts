import { hostname } from "node:os";
import { detectPlatform } from "../../../lib/detectPlatform";
import { loadConfig } from "../../../shared/loadConfig";

export function defaultNodeName(
	host: string = hostname(),
	platform: string = detectPlatform(),
): string {
	const base = host.split(".")[0].toLowerCase();
	return platform === "wsl" ? `${base}-wsl` : base;
}

export function resolveNodeName(): string {
	return loadConfig().sessions?.nodeName?.trim() || defaultNodeName();
}
