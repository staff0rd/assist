import { execSync } from "node:child_process";
import { fetchPrDiff } from "./fetchPrDiff";
import { fetchPrChangedFiles, fetchPrDiffInfo } from "./fetchPrDiffInfo";

export type ReviewContext = {
	branch: string;
	sha: string;
	shortSha: string;
	prNumber: number;
	baseRef: string;
	baseSha: string;
	headRef: string;
	headSha: string;
	changedFiles: string[];
	diff: string;
};

export function gatherContext(): ReviewContext {
	const branch = execSync("git rev-parse --abbrev-ref HEAD", {
		encoding: "utf8",
	}).trim();
	const sha = execSync("git rev-parse HEAD", { encoding: "utf8" }).trim();
	const shortSha = execSync("git rev-parse --short=7 HEAD", {
		encoding: "utf8",
	}).trim();
	const prInfo = fetchPrDiffInfo();
	const changedFiles = fetchPrChangedFiles(prInfo.prNumber);
	const diff = fetchPrDiff(prInfo.prNumber, prInfo.baseSha, prInfo.headSha);
	return {
		branch,
		sha,
		shortSha,
		prNumber: prInfo.prNumber,
		baseRef: prInfo.baseRef,
		baseSha: prInfo.baseSha,
		headRef: prInfo.headRef,
		headSha: prInfo.headSha,
		changedFiles,
		diff,
	};
}
