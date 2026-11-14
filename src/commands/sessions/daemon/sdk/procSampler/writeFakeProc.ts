import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export type FakeProc = {
	pid: number;
	ppid: number;
	comm?: string;
	state?: string;
	startTicks: number;
	cpuTicks?: number;
	cmdline?: string[];
	io?: { rchar: number; wchar: number };
};

export function writeFakeProc(
	root: string,
	procs: readonly FakeProc[],
	uptimeSeconds = 1000,
): void {
	writeFileSync(join(root, "uptime"), `${uptimeSeconds}.00 0.00\n`);
	for (const proc of procs) {
		const dir = join(root, String(proc.pid));
		mkdirSync(dir, { recursive: true });
		const fields = Array.from({ length: 50 }, () => "0");
		fields[0] = proc.state ?? "S";
		fields[1] = String(proc.ppid);
		fields[11] = String(proc.cpuTicks ?? 0);
		fields[19] = String(proc.startTicks);
		writeFileSync(
			join(dir, "stat"),
			`${proc.pid} (${proc.comm ?? "x"}) ${fields.join(" ")}\n`,
		);
		writeFileSync(join(dir, "cmdline"), `${(proc.cmdline ?? []).join("\0")}\0`);
		if (proc.io)
			writeFileSync(
				join(dir, "io"),
				`rchar: ${proc.io.rchar}\nwchar: ${proc.io.wchar}\nsyscr: 0\n`,
			);
	}
}
