import { describe, expect, it } from "vitest";
import { parseProposedGlobs } from "./parseProposedGlobs";

describe("parseProposedGlobs", () => {
	it("reads both lists out of the model's JSON", () => {
		expect(
			parseProposedGlobs(
				'{"criticalPaths": ["**/*.graphql"], "uiPaths": ["src/ui/**"]}',
			),
		).toEqual({ criticalPaths: ["**/*.graphql"], uiPaths: ["src/ui/**"] });
	});

	it("reads the JSON out of surrounding prose or a code fence", () => {
		const output = [
			"Here is the configuration:",
			"```json",
			'{"criticalPaths": ["db/migrations/**"], "uiPaths": []}',
			"```",
		].join("\n");

		expect(parseProposedGlobs(output)).toEqual({
			criticalPaths: ["db/migrations/**"],
			uiPaths: [],
		});
	});

	it("drops blanks, non-strings and duplicates", () => {
		expect(
			parseProposedGlobs(
				'{"criticalPaths": [" **/*.graphql ", "**/*.graphql", "", 7], "uiPaths": []}',
			),
		).toEqual({ criticalPaths: ["**/*.graphql"], uiPaths: [] });
	});

	it("caps each list at eight globs", () => {
		const globs = Array.from({ length: 12 }, (_, index) => `src/${index}/**`);

		expect(
			parseProposedGlobs(JSON.stringify({ criticalPaths: globs, uiPaths: [] }))
				.criticalPaths,
		).toHaveLength(8);
	});

	it("proposes nothing when the output is not JSON", () => {
		expect(parseProposedGlobs("I could not work that out")).toEqual({
			criticalPaths: [],
			uiPaths: [],
		});
	});

	it("proposes nothing when a list is missing or the wrong shape", () => {
		expect(parseProposedGlobs('{"criticalPaths": "**/*.graphql"}')).toEqual({
			criticalPaths: [],
			uiPaths: [],
		});
	});
});
