import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { findLeafProcess } from "./findLeafProcess";
import { type ProcStat, readProcStat } from "./readProcStat";
import { trimProcessCommand } from "./trimProcessCommand";

export type LeafProcessSample = {
	pid: number;
	command: string;
	cpuTicks: number;
	readBytes?: number;
	writeBytes?: number;
};

async function readText(path: string): Promise<string | undefined> {
	try {
		return await readFile(path, "utf8");
	} catch {
		return undefined;
	}
}

function ioCounter(io: string | undefined, key: string): number | undefined {
	const match = io?.match(new RegExp(`^${key}: (\\d+)$`, "m"));
	return match ? Number(match[1]) : undefined;
}

export async function sampleLeafProcess(
	procRoot: string,
	rootPid: number,
	minStartTicks: number,
): Promise<LeafProcessSample | undefined> {
	const entries = await readdir(procRoot).catch(() => []);
	const stats = await Promise.all(
		entries
			.filter((name) => /^\d+$/.test(name))
			.map((name) => readProcStat(procRoot, Number(name))),
	);
	const leaf = findLeafProcess(
		stats.filter((stat): stat is ProcStat => stat !== undefined),
		rootPid,
		minStartTicks,
	);
	if (!leaf) return undefined;
	const dir = join(procRoot, String(leaf.pid));
	const [cmdline, io] = await Promise.all([
		readText(join(dir, "cmdline")),
		readText(join(dir, "io")),
	]);
	const command = trimProcessCommand(cmdline?.split("\0") ?? []);
	if (!command) return undefined;
	return {
		pid: leaf.pid,
		command,
		cpuTicks: leaf.cpuTicks,
		readBytes: ioCounter(io, "rchar"),
		writeBytes: ioCounter(io, "wchar"),
	};
}
