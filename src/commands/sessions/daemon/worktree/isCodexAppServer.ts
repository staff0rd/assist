import { readProc } from "./readProc";

export function isCodexAppServer(pid: number, procRoot = "/proc"): boolean {
	const args = readProc(procRoot, pid, "cmdline")?.split("\0") ?? [];
	return (
		args[0]?.includes("/app-server-daemon/") === true ||
		args.includes("--managed-daemon")
	);
}
