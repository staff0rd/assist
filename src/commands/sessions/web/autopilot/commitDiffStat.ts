import { execFile } from "node:child_process";
import { promisify } from "node:util";

export type DiffStat = { insertions: number; deletions: number };

const execFileAsync = promisify(execFile);

const shaStats = new Map<string, Promise<DiffStat | undefined>>();

async function measureSha(
	cwd: string,
	sha: string,
): Promise<DiffStat | undefined> {
	let out: string;
	try {
		({ stdout: out } = await execFileAsync(
			"git",
			["show", "--numstat", "--format=", sha],
			{ cwd, encoding: "utf8", windowsHide: true, maxBuffer: 64 * 1024 * 1024 },
		));
	} catch {
		return undefined;
	}
	const stat = { insertions: 0, deletions: 0 };
	for (const line of out.split("\n")) {
		const [added, removed] = line.split("\t");
		stat.insertions += Number(added) || 0;
		stat.deletions += Number(removed) || 0;
	}
	return stat;
}

function shaStat(cwd: string, sha: string): Promise<DiffStat | undefined> {
	const key = `${cwd}\0${sha}`;
	let pending = shaStats.get(key);
	if (!pending) {
		pending = measureSha(cwd, sha).then((stat) => {
			if (!stat) shaStats.delete(key);
			return stat;
		});
		shaStats.set(key, pending);
	}
	return pending;
}

export async function commitDiffStat(
	cwd: string,
	shas: string[],
): Promise<DiffStat> {
	const stats = await Promise.all(shas.map((sha) => shaStat(cwd, sha)));
	const total = { insertions: 0, deletions: 0 };
	for (const stat of stats) {
		total.insertions += stat?.insertions ?? 0;
		total.deletions += stat?.deletions ?? 0;
	}
	return total;
}
