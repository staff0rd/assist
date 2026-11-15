import { spawnSync } from "node:child_process";
import { harnesses } from "./harnesses";

let cached: string[] | undefined;

function codexSupportsNoDaemon(): boolean {
	const result = spawnSync(harnesses.codex.command, ["--help"], {
		encoding: "utf8",
		windowsHide: true,
		timeout: 10_000,
	});
	return `${result.stdout ?? ""}`.includes("--no-daemon");
}

export function codexIsolatedHookArgs(): string[] {
	cached ??= codexSupportsNoDaemon() ? ["--no-daemon"] : [];
	return cached;
}

export function resetCodexIsolatedHookArgs(): void {
	cached = undefined;
}
