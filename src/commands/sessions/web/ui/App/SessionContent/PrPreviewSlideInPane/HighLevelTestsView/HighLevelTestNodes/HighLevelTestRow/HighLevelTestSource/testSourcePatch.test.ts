import { describe, expect, it } from "vitest";
import { testSourcePatch } from "./testSourcePatch";

describe("testSourcePatch", () => {
	it("numbers the source from the test's line as unchanged context", () => {
		expect(
			testSourcePatch([
				{ line: 12, source: 'it("a", () => {\n\texpect(1);\n});' },
			]),
		).toBe('@@ -12,3 +12,3 @@\n it("a", () => {\n \texpect(1);\n });');
	});

	it("gives each excerpt its own hunk", () => {
		expect(
			testSourcePatch([
				{ line: 3, source: "a" },
				{ line: 40, source: "b\nc" },
			]),
		).toBe("@@ -3,1 +3,1 @@\n a\n@@ -40,2 +40,2 @@\n b\n c");
	});

	it("shows a deleted test's source as removed lines at its base line numbers", () => {
		expect(testSourcePatch([{ line: 7, source: "a\nb" }], true)).toBe(
			"@@ -7,2 +6,0 @@\n-a\n-b",
		);
	});
});
