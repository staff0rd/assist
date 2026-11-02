import { loadConfig } from "../../../shared/loadConfig";
import { getRepoInfo } from "../../prs/shared";
import { buildHighLevelStructure } from "./buildHighLevelStructure";
import { capHighLevelPatches } from "./capHighLevelPatches";
import { evaluateHighLevelChecks } from "./evaluateHighLevelChecks";
import { fetchHighLevelFiles } from "./fetchHighLevelFiles";
import { fetchHighLevelPr } from "./fetchHighLevelPr";
import {
	gatherHighLevelSlices,
	type HighLevelSlicing,
} from "./gatherHighLevelSlices";
import { gatherHighLevelTests } from "./gatherHighLevelTests";
import type { HighLevelOverlaySubject } from "./HighLevelOverlaySubject";
import { loadReopenedReview } from "./loadReopenedReview";
import { resolveHighLevelConfig } from "./resolveHighLevelConfig";
import { selectCriticalDiffs } from "./selectCriticalDiffs";

export function gatherHighLevelSubject(
	prNumber: number,
	force: boolean,
	slicing?: HighLevelSlicing,
): HighLevelOverlaySubject {
	const { org, repo } = getRepoInfo();
	const slug = `${org}/${repo}`;
	const pr = fetchHighLevelPr(prNumber, { org, repo });
	const config = resolveHighLevelConfig(loadConfig());
	const fetched = fetchHighLevelFiles(prNumber, slug);
	const files = capHighLevelPatches(fetched, config.criticalPaths);
	const head = { repo: slug, headRef: pr.headRef, headSha: pr.headSha };
	const slices =
		slicing && config.slices
			? gatherHighLevelSlices(head, files, slicing)
			: undefined;
	return {
		...head,
		prNumber,
		title: pr.title,
		checks: evaluateHighLevelChecks({
			...pr,
			changedFiles: files.map((file) => file.path),
			config,
		}),
		structure: buildHighLevelStructure(files),
		criticalDiffs: selectCriticalDiffs(files, config.criticalPaths),
		criticalPaths: config.criticalPaths,
		tests: gatherHighLevelTests(fetched, config.testPaths, slug, pr.headSha),
		testPaths: config.testPaths,
		collapsedPaths: config.collapsedPaths,
		...(slices ? { slices } : {}),
		...(force ? {} : loadReopenedReview(slug, pr.headRef, pr.headSha)),
	};
}
