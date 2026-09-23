import { loadConfig } from "../../../shared/loadConfig";
import { getRepoInfo } from "../../prs/shared";
import { buildHighLevelStructure } from "./buildHighLevelStructure";
import { capHighLevelPatches } from "./capHighLevelPatches";
import { evaluateHighLevelChecks } from "./evaluateHighLevelChecks";
import { fetchHighLevelFiles } from "./fetchHighLevelFiles";
import { fetchHighLevelPr } from "./fetchHighLevelPr";
import { loadHighLevelReview } from "./loadHighLevelReview";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";
import { selectCriticalDiffs } from "./selectCriticalDiffs";

export function gatherHighLevelSubject(
	prNumber: number,
	force: boolean,
): HighLevelOverlaySubject {
	const { org, repo } = getRepoInfo();
	const slug = `${org}/${repo}`;
	const pr = fetchHighLevelPr(prNumber, { org, repo });
	const config = resolveHighLevelConfig(loadConfig());
	const files = capHighLevelPatches(
		fetchHighLevelFiles(prNumber, slug),
		config.criticalPaths,
	);
	const saved = force
		? undefined
		: loadHighLevelReview(slug, pr.headRef, pr.headSha);
	return {
		repo: slug,
		prNumber,
		title: pr.title,
		headRef: pr.headRef,
		headSha: pr.headSha,
		checks: evaluateHighLevelChecks({
			body: pr.body,
			changedFiles: files.map((file) => file.path),
			config,
		}),
		structure: buildHighLevelStructure(files),
		criticalDiffs: selectCriticalDiffs(files, config.criticalPaths),
		criticalPaths: config.criticalPaths,
		...(saved ? { saved } : {}),
	};
}
