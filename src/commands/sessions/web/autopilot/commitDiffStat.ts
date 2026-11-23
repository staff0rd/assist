import { execFileSync } from "node:child_process";

export type DiffStat = { insertions: number; deletions: number };

export function commitDiffStat(cwd: string, shas: string[]): DiffStat {
	const stat = { insertions: 0, deletions: 0 };
	for (const sha of shas) {
		let out: string;
		try {
			out = execFileSync("git", ["show", "--numstat", "--format=", sha], {
				cwd,
				encoding: "utf8",
				stdio: ["ignore", "pipe", "ignore"],
			});
		} catch {
			continue;
		}
		for (const line of out.split("\n")) {
			const [added, removed] = line.split("\t");
			stat.insertions += Number(added) || 0;
			stat.deletions += Number(removed) || 0;
		}
	}
	return stat;
}
