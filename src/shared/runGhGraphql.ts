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

function throwOnGraphqlErrors(stdout: string): void {
	let parsed: unknown;
	try {
		parsed = JSON.parse(stdout);
	} catch {
		return;
	}
	if (!parsed || typeof parsed !== "object") return;
	const errors = (parsed as { errors?: unknown }).errors;
	if (!Array.isArray(errors) || errors.length === 0) return;
	const messages = errors
		.map((entry) =>
			entry && typeof entry === "object" && "message" in entry
				? String((entry as { message: unknown }).message)
				: String(entry),
		)
		.join("; ");
	throw new Error(messages || "GraphQL request returned errors");
}

export function runGhGraphql(mutation: string, vars: GhGraphqlVars): string {
	const queryFile = join(tmpdir(), `gh-query-${Date.now()}.graphql`);
	writeFileSync(queryFile, mutation);
	try {
		const result = spawnSync("gh", buildArgs(queryFile, vars), {
			encoding: "utf8",
		});
		if (result.status !== 0) throw new Error(result.stderr || result.stdout);
		throwOnGraphqlErrors(result.stdout);
		return result.stdout;
	} finally {
		unlinkSync(queryFile);
	}
}
