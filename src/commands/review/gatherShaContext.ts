import { execSync } from "node:child_process";

export type ShaContext = {
	sha: string;
	shortSha: string;
	parentSha: string;
	changedFiles: string[];
	diff: string;
};

function resolveSha(ref: string, format: "long" | "short"): string {
	const flag = format === "short" ? "--short=7 " : "";
	try {
		return execSync(`git rev-parse --verify ${flag}${ref}^{commit}`, {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "pipe"],
		}).trim();
	} catch {
		console.error(`Error: could not resolve commit \`${ref}\`.`);
		process.exit(1);
	}
}

export function gatherShaContext(ref: string): ShaContext {
	const sha = resolveSha(ref, "long");
	const shortSha = resolveSha(sha, "short");
	const parentSha = resolveSha(`${sha}^`, "long");
	const range = `${parentSha}..${sha}`;
	const changedFiles = execSync(`git diff --name-only ${range}`, {
		encoding: "utf-8",
		maxBuffer: 64 * 1024 * 1024,
	})
		.trim()
		.split("\n")
		.filter(Boolean);
	const diff = execSync(`git diff ${range}`, {
		encoding: "utf-8",
		maxBuffer: 256 * 1024 * 1024,
	});
	return { sha, shortSha, parentSha, changedFiles, diff };
}
