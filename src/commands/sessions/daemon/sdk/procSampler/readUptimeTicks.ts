import { readFile } from "node:fs/promises";
import { join } from "node:path";

// why: /proc/<pid>/stat start times are in USER_HZ clock ticks, which is 100 on every mainstream Linux build
export const CLOCK_TICKS_PER_SECOND = 100;

export async function readUptimeTicks(
	procRoot: string,
): Promise<number | undefined> {
	try {
		const text = await readFile(join(procRoot, "uptime"), "utf8");
		return Math.floor(Number.parseFloat(text) * CLOCK_TICKS_PER_SECOND);
	} catch {
		return undefined;
	}
}
