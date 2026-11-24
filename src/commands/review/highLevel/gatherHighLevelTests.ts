import { mapAsync } from "../../../shared/mapAsync";
import { capHighLevelTestSources } from "./capHighLevelTestSources";
import { collectHighLevelTests } from "./collectHighLevelTests";
import { fetchFileAtSha } from "./fetchFileAtSha";
import { fetchHighLevelMergeBase } from "./fetchHighLevelMergeBase";
import { highLevelTestCandidates } from "./highLevelTestCandidates";
import type { HighLevelGatherHead } from "./HighLevelSubjectCache";
import type { HighLevelFile, HighLevelTestFile } from "./types";

const FETCH_CONCURRENCY = 8;

type SourceRequest = { key: string; sha: string; path: string };

function needsBase(file: HighLevelFile): boolean {
	if (file.status === "removed") return true;
	return file.patch !== undefined && file.status !== "added";
}

function baseKey(file: HighLevelFile): string {
	return `base:${file.path}`;
}

async function sourceRequests(
	candidates: HighLevelFile[],
	head: Pick<HighLevelGatherHead, "repo" | "prNumber" | "headSha">,
): Promise<SourceRequest[]> {
	const heads = candidates
		.filter((file) => file.status !== "removed")
		.map((file) => ({ key: file.path, sha: head.headSha, path: file.path }));
	const withBase = candidates.filter(needsBase);
	if (withBase.length === 0) return heads;
	const mergeBase = await fetchHighLevelMergeBase(
		head.repo,
		head.prNumber,
		head.headSha,
	);
	return [
		...heads,
		...withBase.map((file) => ({
			key: baseKey(file),
			sha: mergeBase,
			path: file.previousPath ?? file.path,
		})),
	];
}

export async function gatherHighLevelTests(
	files: HighLevelFile[],
	testPaths: string[],
	head: Pick<HighLevelGatherHead, "repo" | "prNumber" | "headSha">,
): Promise<HighLevelTestFile[]> {
	const requests = await sourceRequests(
		highLevelTestCandidates(files, testPaths),
		head,
	);
	const contents = await mapAsync(requests, FETCH_CONCURRENCY, (request) =>
		fetchFileAtSha(head.repo, request.sha, request.path),
	);
	const sources = new Map(
		requests.map((request, i) => [request.key, contents[i] ?? ""]),
	);
	return capHighLevelTestSources(
		collectHighLevelTests(files, testPaths, {
			head: (path) => sources.get(path) ?? "",
			base: (file) => sources.get(baseKey(file)) ?? "",
		}),
	);
}
