import { parseDiff } from "react-diff-view";
import { describe, expect, it } from "vitest";
import { diffFileTotals } from "./diffFileTotals";

const twoFiles = `diff --git a/a.ts b/a.ts
index 1111111..2222222 100644
--- a/a.ts
+++ b/a.ts
@@ -1,3 +1,4 @@
 const kept = 1;
-const gone = 2;
+const added = 2;
+const alsoAdded = 3;
 const tail = 4;
diff --git a/b.ts b/b.ts
new file mode 100644
index 0000000..3333333
--- /dev/null
+++ b/b.ts
@@ -0,0 +1,2 @@
+export const one = 1;
+export const two = 2;
`;

describe("diffFileTotals", () => {
	it("sums inserts and deletes across every file and hunk", () => {
		expect(diffFileTotals(parseDiff(twoFiles))).toEqual({
			files: 2,
			added: 4,
			removed: 1,
		});
	});

	it("ignores context lines", () => {
		const [file] = parseDiff(twoFiles);
		if (!file) throw new Error("expected a parsed file");

		expect(diffFileTotals([file])).toEqual({
			files: 1,
			added: 2,
			removed: 1,
		});
	});

	it("reports zeroes for no files", () => {
		expect(diffFileTotals([])).toEqual({ files: 0, added: 0, removed: 0 });
	});
});
