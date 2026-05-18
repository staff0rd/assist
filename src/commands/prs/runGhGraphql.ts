import { spawnSync } from "node:child_process";
import { unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

type GhGraphqlVars = Record<string, string | number>;

function buildArgs(queryFile: string, vars: GhGraphqlVars): string[] {
	const args = ["api", "graphql", "-F", `query=@${queryFile}`];
	for (const [key, value] of Object.entries(vars)) {
		const flag = typeof value === "number" ? "-F" : "-f";
		args.push(flag, `${key}=${value}`);
	}
	return args;
}

export function runGhGraphql(mutation: string, vars: GhGraphqlVars): string {
	const queryFile = join(tmpdir(), `gh-query-${Date.now()}.graphql`);
	writeFileSync(queryFile, mutation);
	try {
		const result = spawnSync("gh", buildArgs(queryFile, vars), {
			encoding: "utf-8",
		});
		if (result.status !== 0) throw new Error(result.stderr || result.stdout);
		return result.stdout;
	} finally {
		unlinkSync(queryFile);
	}
}
