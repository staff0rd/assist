import { execFileSync } from "node:child_process";

// Best-effort scan for sessions daemon processes; win32 has no ps, so stray
// detection is POSIX-only
export function listDaemonPids(): number[] {
	if (process.platform === "win32") return [];
	try {
		const out = execFileSync("ps", ["-eo", "pid=,args="], {
			encoding: "utf8",
		});
		return out
			.split("\n")
			.filter((line) => line.includes("assist") && / daemon run\b/.test(line))
			.map((line) => Number.parseInt(line.trim(), 10))
			.filter((pid) => Number.isInteger(pid));
	} catch {
		return [];
	}
}
