import { execFileSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { fetchHighLevelFiles } from "./fetchHighLevelFiles";

vi.mock("node:child_process", () => ({ execFileSync: vi.fn() }));

describe("fetchHighLevelFiles", () => {
	beforeEach(() => vi.clearAllMocks());

	it("passes the jq pipes as one literal argument and parses paginated file records", () => {
		vi.mocked(execFileSync).mockReturnValue(
			'{"filename":"src/a.ts","status":"added","additions":1,"deletions":0,"patch":"@@ -0,0 +1 @@"}\n{"filename":"old.ts","status":"removed","additions":0,"deletions":2}\n{"filename":"new.ts","previous_filename":"was.ts","status":"renamed","additions":1,"deletions":1}\n{"filename":"b.ts","previous_filename":null,"status":"modified","additions":1,"deletions":1}\n',
		);
		const files = fetchHighLevelFiles(1301, "owner/repo");
		expect(execFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"api",
				"repos/owner/repo/pulls/1301/files",
				"--paginate",
				"--jq",
				".[] | {filename,previous_filename,status,additions,deletions,patch} | @json",
			],
			{ encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
		);
		expect(files).toMatchObject([
			{
				path: "src/a.ts",
				status: "added",
				additions: 1,
				patch: "@@ -0,0 +1 @@",
			},
			{ path: "old.ts", status: "removed", deletions: 2 },
			{ path: "new.ts", previousPath: "was.ts", status: "modified" },
			{ path: "b.ts", status: "modified" },
		]);
		expect(files[3]).not.toHaveProperty("previousPath");
	});

	it("propagates API failures instead of returning an empty checklist", () => {
		vi.mocked(execFileSync).mockImplementation(() => {
			throw new Error("API unavailable");
		});
		expect(() => fetchHighLevelFiles(1301, "owner/repo")).toThrow(
			"API unavailable",
		);
	});
});
