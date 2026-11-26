import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fetchFileAtSha } from "./fetchFileAtSha";
import { fetchHighLevelFiles } from "./fetchHighLevelFiles";
import { fetchHighLevelPr } from "./fetchHighLevelPr";
import { gatherHighLevelSubject } from "./gatherHighLevelSubject";
import { highLevelSlicesPath } from "./highLevelSlicesPath";
import type { HighLevelFile } from "./types";
import { writeJsonFile } from "./writeJsonFile";

const mockGetBaseRepoInfo = vi.fn();
vi.mock("../../prs/getBaseRepoInfo", () => ({
	getBaseRepoInfo: () => mockGetBaseRepoInfo(),
}));
vi.mock("../../../shared/loadConfig", () => ({ loadConfig: () => ({}) }));
vi.mock("./fetchHighLevelPr", () => ({ fetchHighLevelPr: vi.fn() }));
vi.mock("./fetchHighLevelFiles", () => ({ fetchHighLevelFiles: vi.fn() }));
vi.mock("./fetchFileAtSha", () => ({ fetchFileAtSha: vi.fn() }));
vi.mock("./fetchHighLevelMergeBase", () => ({
	fetchHighLevelMergeBase: vi.fn(async () => "base"),
}));

const files: HighLevelFile[] = [
	{
		path: "src/a.ts",
		status: "modified",
		additions: 1,
		deletions: 1,
		diffUrl: "#a",
		patch: "@@ -1 +1 @@\n-old\n+new",
	},
	{
		path: "src/a.test.ts",
		status: "modified",
		additions: 1,
		deletions: 0,
		diffUrl: "#t",
		patch: "@@ -1 +1 @@\n+it",
	},
];

function pr(headSha: string, mergeable: "MERGEABLE" | "CONFLICTING") {
	return {
		title: "T",
		body: "## What\nx\n## Why\ny",
		headRef: "feat/x",
		headSha,
		baseRef: "main",
		mergeable,
		linkedIssues: [],
	};
}

function saveSlices(headSha: string): void {
	writeJsonFile(highLevelSlicesPath("org/repo", "feat/x", headSha), {
		slices: [{ title: "S", summary: "s", hunks: [] }],
	});
}

const reuse = { force: false, reuseOnly: true };
const original = process.env.ASSIST_STORE_DIR;

beforeEach(() => {
	process.env.ASSIST_STORE_DIR = mkdtempSync(
		join(tmpdir(), "assist-high-level-subject-"),
	);
	mockGetBaseRepoInfo.mockReturnValue({ org: "org", repo: "repo" });
	vi.mocked(fetchHighLevelFiles).mockReturnValue(files);
	vi.mocked(fetchFileAtSha).mockResolvedValue('it("works", () => {});');
});

afterEach(() => {
	vi.clearAllMocks();
	if (original === undefined) delete process.env.ASSIST_STORE_DIR;
	else process.env.ASSIST_STORE_DIR = original;
});

describe("gatherHighLevelSubject", () => {
	it("reopens from the cached subject without per-file fetches when the head SHA matches", async () => {
		saveSlices("sha1");
		vi.mocked(fetchHighLevelPr).mockReturnValue(pr("sha1", "MERGEABLE"));
		const first = await gatherHighLevelSubject(42, false, reuse);
		vi.clearAllMocks();
		vi.mocked(fetchHighLevelPr).mockReturnValue(pr("sha1", "CONFLICTING"));

		const reopened = await gatherHighLevelSubject(42, false, reuse);

		expect(fetchHighLevelFiles).not.toHaveBeenCalled();
		expect(fetchFileAtSha).not.toHaveBeenCalled();
		expect(reopened.tests).toEqual(first.tests);
		expect(reopened.tests[0]?.path).toBe("src/a.test.ts");
		expect(reopened.structure).toEqual(first.structure);
		expect(reopened.slices).toEqual(first.slices);
		const conflicts = (subject: typeof first) =>
			subject.checks.find((check) => check.id === "no-merge-conflicts")?.status;
		expect(conflicts(first)).toBe("pass");
		expect(conflicts(reopened)).toBe("fail");
	});

	it("regathers when the head SHA has moved", async () => {
		saveSlices("sha1");
		saveSlices("sha2");
		vi.mocked(fetchHighLevelPr).mockReturnValue(pr("sha1", "MERGEABLE"));
		await gatherHighLevelSubject(42, false, reuse);
		vi.clearAllMocks();
		vi.mocked(fetchHighLevelPr).mockReturnValue(pr("sha2", "MERGEABLE"));

		await gatherHighLevelSubject(42, false, reuse);

		expect(fetchHighLevelFiles).toHaveBeenCalledTimes(1);
		expect(fetchFileAtSha).toHaveBeenCalledWith(
			"org/repo",
			"sha2",
			"src/a.test.ts",
		);
	});
});
