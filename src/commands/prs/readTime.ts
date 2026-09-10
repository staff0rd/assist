import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { countReadingWords } from "./countReadingWords";
import { formatReadDuration } from "./formatReadDuration";
import { readBodyArgument } from "./readBodyArgument";
import {
	type ReadTimeTarget,
	resolveReadTimeTarget,
} from "./resolveReadTimeTarget";
import { getRepoInfo, isGhNotInstalled, isNotFound } from "./shared";

const WORDS_PER_MINUTE = 200;

const CODE_SCAN_WORDS_PER_MINUTE = 100;

export async function readTime(target: string): Promise<void> {
	const body = await loadBody(resolveReadTimeTarget(target));
	const { prose, code } = countReadingWords(body);
	const words = prose + code;
	const seconds = Math.round(
		(prose / WORDS_PER_MINUTE + code / CODE_SCAN_WORDS_PER_MINUTE) * 60,
	);
	const label = words === 1 ? "word" : "words";

	console.log(`${words} ${label} · ~${formatReadDuration(seconds)} read`);
}

async function loadBody(target: ReadTimeTarget): Promise<string> {
	if (target.kind === "stdin") return readBodyArgument("-");
	if (target.kind === "file") return readDraftFile(target.path);
	return fetchPrBody(target.number, target.repo);
}

function readDraftFile(path: string): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		console.error(`Error: Could not read \`${path}\`.`);
		console.error(
			"Pass a pull request number, a GitHub pull request URL, - for stdin, or a path to a file.",
		);
		process.exit(1);
	}
}

function fetchPrBody(
	number: number,
	repo: { org: string; repo: string } | null,
): string {
	const { org, repo: name } = repo ?? getRepoInfo();
	try {
		const raw = execSync(`gh pr view ${number} --json body -R ${org}/${name}`, {
			encoding: "utf8",
		});
		return (JSON.parse(raw) as { body: string | null }).body ?? "";
	} catch (error) {
		if (isGhNotInstalled(error)) {
			console.error("Error: GitHub CLI (gh) is not installed.");
			console.error("Install it from https://cli.github.com/");
			process.exit(1);
		}
		if (isNotFound(error)) {
			console.error(`Error: Pull request ${org}/${name}#${number} not found.`);
			process.exit(1);
		}
		throw error;
	}
}
