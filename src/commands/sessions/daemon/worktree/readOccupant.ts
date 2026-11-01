import { readFileSync } from "node:fs";

export type Occupant = { pid: number; name: string; vscode: boolean };

const VSCODE_PATHS = [
	"/.vscode-server/",
	"/.vscode-server-insiders/",
	"/.vscode-remote-containers/",
	"/usr/share/code/",
	"/usr/share/code-insiders/",
	"/Microsoft VS Code/",
];
const MAX_ANCESTORS = 64;

export function readOccupant(pid: number, procRoot = "/proc"): Occupant {
	return {
		pid,
		name: readProc(procRoot, pid, "comm")?.trim() || `pid ${pid}`,
		vscode: underVsCode(pid, procRoot),
	};
}

function underVsCode(pid: number, procRoot: string): boolean {
	let current: number | undefined = pid;
	for (
		let depth = 0;
		current && current > 1 && depth < MAX_ANCESTORS;
		depth++
	) {
		const cmdline = readProc(procRoot, current, "cmdline");
		if (cmdline && VSCODE_PATHS.some((path) => cmdline.includes(path)))
			return true;
		current = parentPid(readProc(procRoot, current, "stat"));
	}
	return false;
}

function parentPid(stat: string | undefined): number | undefined {
	if (!stat) return undefined;
	const fields = stat.slice(stat.lastIndexOf(")") + 2).split(" ");
	const ppid = Number(fields[1]);
	return Number.isInteger(ppid) ? ppid : undefined;
}

function readProc(
	procRoot: string,
	pid: number,
	file: string,
): string | undefined {
	try {
		return readFileSync(`${procRoot}/${pid}/${file}`, "utf8");
	} catch {
		return undefined;
	}
}
