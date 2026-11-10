import { parseDiffFiles } from "../DiffContent/useDiffContent/useDiffFileData/parseDiffFiles";
import { describe, expect, it } from "vitest";
import { hunklessNoticeText } from "./hunklessNoticeText";

function notice(diff: string): string {
	const [file] = parseDiffFiles(diff);
	expect(file.hunks).toHaveLength(0);
	return hunklessNoticeText(file);
}

describe("hunklessNoticeText", () => {
	it("names both paths of a rename without changes", () => {
		expect(
			notice(
				[
					"diff --git a/coach-support/CoachAvatar.tsx b/common/CoachAvatar.tsx",
					"similarity index 100%",
					"rename from coach-support/CoachAvatar.tsx",
					"rename to common/CoachAvatar.tsx",
					"",
				].join("\n"),
			),
		).toBe(
			"Renamed without changes: coach-support/CoachAvatar.tsx → common/CoachAvatar.tsx",
		);
	});

	it("keeps the binary notice for files git reports as binary", () => {
		expect(
			notice(
				[
					"diff --git a/logo.png b/logo.png",
					"index 1111111..2222222 100644",
					"Binary files a/logo.png and b/logo.png differ",
					"",
				].join("\n"),
			),
		).toBe("Binary file — no preview.");
	});

	it("reports a renamed binary file as binary", () => {
		expect(
			notice(
				[
					"diff --git a/old.png b/new.png",
					"similarity index 90%",
					"rename from old.png",
					"rename to new.png",
					"index 1111111..2222222 100644",
					"Binary files a/old.png and b/new.png differ",
					"",
				].join("\n"),
			),
		).toBe("Binary file — no preview.");
	});

	it("reports a mode-only change", () => {
		expect(
			notice(
				[
					"diff --git a/run.sh b/run.sh",
					"old mode 100644",
					"new mode 100755",
					"",
				].join("\n"),
			),
		).toBe("File mode changed — no content changes.");
	});

	it("reports an empty added file", () => {
		expect(
			notice(
				[
					"diff --git a/empty.txt b/empty.txt",
					"new file mode 100644",
					"index 0000000..e69de29",
					"",
				].join("\n"),
			),
		).toBe("Empty file added.");
	});

	it("reports an empty deleted file", () => {
		expect(
			notice(
				[
					"diff --git a/empty.txt b/empty.txt",
					"deleted file mode 100644",
					"index e69de29..0000000",
					"",
				].join("\n"),
			),
		).toBe("Empty file deleted.");
	});
});
