import { readFile } from "node:fs/promises";
import { join } from "node:path";

export type ProcStat = {
	pid: number;
	ppid: number;
	state: string;
	cpuTicks: number;
	startTicks: number;
};

export async function readProcStat(
	procRoot: string,
	pid: number,
): Promise<ProcStat | undefined> {
	try {
		const text = await readFile(join(procRoot, String(pid), "stat"), "utf8");
		// why: comm (field 2) is parenthesised and may itself contain spaces or ')'
		const fields = text.slice(text.lastIndexOf(")") + 2).split(" ");
		return {
			pid,
			state: fields[0],
			ppid: Number(fields[1]),
			cpuTicks: Number(fields[11]) + Number(fields[12]),
			startTicks: Number(fields[19]),
		};
	} catch {
		return undefined;
	}
}
