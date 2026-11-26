import { describe, expect, it } from "vitest";
import { parseHighLevelPreview } from "./parseHighLevelPreview";

describe("parseHighLevelPreview", () => {
	it("keeps the test regrouping", () => {
		const testRegrouping = {
			"a.test.ts": [
				{
					describe: "when ready",
					children: [{ id: "a.test.ts:1", it: "passes" }],
				},
			],
		};

		const payload = parseHighLevelPreview(JSON.stringify({ testRegrouping }));

		expect(payload.testRegrouping).toEqual(testRegrouping);
	});

	it("leaves the regrouping out when the payload has none", () => {
		expect(parseHighLevelPreview("{}")).not.toHaveProperty("testRegrouping");
	});
});
