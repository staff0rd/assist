import { describe, expect, it } from "vitest";
import { parseDiff } from "react-diff-view";
import { highLevelUnifiedDiff } from "./highLevelUnifiedDiff";

const patch = "@@ -1,2 +1,2 @@\n-old\n+new\n context";

describe("highLevelUnifiedDiff", () => {
	it("parses back as the modified file the patch came from", () => {
		const [file] = parseDiff(
			highLevelUnifiedDiff("src/app.ts", "modified", patch),
		);

		expect(file?.type).toBe("modify");
		expect(file?.newPath).toBe("src/app.ts");
		expect(file?.hunks).toHaveLength(1);
	});

	it("marks an added file as coming from nothing", () => {
		const [file] = parseDiff(
			highLevelUnifiedDiff("src/new.ts", "added", patch),
		);

		expect(file?.type).toBe("add");
		expect(file?.oldPath).toBe("/dev/null");
	});

	it("marks a removed file as going nowhere", () => {
		const [file] = parseDiff(
			highLevelUnifiedDiff("src/gone.ts", "removed", patch),
		);

		expect(file?.type).toBe("delete");
		expect(file?.newPath).toBe("/dev/null");
	});
});
