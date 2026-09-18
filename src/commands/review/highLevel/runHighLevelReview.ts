import { loadConfig } from "../../../shared/loadConfig";
import { getCurrentPrNumber, getRepoInfo } from "../../prs/shared";
import { fetchPrChangedFiles } from "../fetchPrDiffInfo";
import { evaluateHighLevelChecks } from "./evaluateHighLevelChecks";
import { fetchHighLevelPr } from "./fetchHighLevelPr";
import type { HighLevelOverlaySubject } from "./openHighLevelOverlay";
import { openHighLevelOverlay } from "./openHighLevelOverlay";
import { printHighLevelChecklist } from "./printHighLevelChecklist";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";

function resolvePrNumber(number: string | undefined): number {
	if (number === undefined) return getCurrentPrNumber();
	const parsed = Number(number);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		console.error(`Error: \`${number}\` is not a pull request number.`);
		process.exit(1);
	}
	return parsed;
}

function gather(number: string | undefined): HighLevelOverlaySubject {
	const prNumber = resolvePrNumber(number);
	const { org, repo } = getRepoInfo();
	const pr = fetchHighLevelPr(prNumber, { org, repo });
	const changedFiles = fetchPrChangedFiles(prNumber);
	return {
		repo: `${org}/${repo}`,
		prNumber,
		headRef: pr.headRef,
		headSha: pr.headSha,
		changedFileCount: changedFiles.length,
		checks: evaluateHighLevelChecks({
			body: pr.body,
			changedFiles,
			config: resolveHighLevelConfig(loadConfig()),
		}),
	};
}

export async function runHighLevelReview(
	number: string | undefined,
): Promise<void> {
	const subject = gather(number);
	const sessionId = process.env.ASSIST_SESSION_ID;
	if (process.env.ASSIST_SESSION !== "1" || !sessionId)
		return printHighLevelChecklist(subject);
	await openHighLevelOverlay(sessionId, subject);
}
