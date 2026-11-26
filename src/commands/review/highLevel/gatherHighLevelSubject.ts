import { loadConfig } from "../../../shared/loadConfig";
import { getBaseRepoInfo } from "../../prs/getBaseRepoInfo";
import { evaluateHighLevelChecks } from "./evaluateHighLevelChecks";
import { fetchHighLevelPr } from "./fetchHighLevelPr";
import { gatherFreshHighLevelSubject } from "./gatherFreshHighLevelSubject";
import type { HighLevelSlicing } from "./gatherHighLevelSlices";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { loadReopenedReview } from "./loadReopenedReview";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";
import { reuseCachedHighLevelSubject } from "./reuseCachedHighLevelSubject";

export async function gatherHighLevelSubject(
	prNumber: number,
	force: boolean,
	slicing?: HighLevelSlicing,
): Promise<HighLevelOverlaySubject> {
	const { org, repo } = getBaseRepoInfo();
	const pr = fetchHighLevelPr(prNumber, { org, repo });
	const config = resolveHighLevelConfig(loadConfig());
	const head = {
		repo: `${org}/${repo}`,
		headRef: pr.headRef,
		headSha: pr.headSha,
	};
	const { cache, sliced } =
		reuseCachedHighLevelSubject({ ...head, prNumber }, config, slicing) ??
		(await gatherFreshHighLevelSubject({ ...head, prNumber }, config, slicing));
	return {
		...head,
		prNumber,
		title: pr.title,
		body: pr.body,
		checks: evaluateHighLevelChecks({
			...pr,
			changedFiles: cache.changedFiles,
			config,
			sliced: sliced !== undefined,
		}),
		structure: cache.structure,
		criticalDiffs: cache.criticalDiffs,
		criticalPaths: config.criticalPaths,
		tests: cache.tests,
		testPaths: config.testPaths,
		collapsedPaths: config.collapsedPaths,
		...sliced,
		...loadReopenedReview({ ...head, prNumber }, force),
	};
}
