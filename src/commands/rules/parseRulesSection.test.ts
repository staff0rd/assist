import { describe, expect, it } from "vitest";
import { parseRulesSection } from "./parseRulesSection";

describe("parseRulesSection", () => {
	it("parses code and text from em-dash bullets", () => {
		const content = [
			"# Title",
			"",
			"## Rules",
			"",
			"- **R1** — Keep it tight",
			"- **R2** — Cite the source",
			"",
		].join("\n");

		expect(parseRulesSection(content)).toEqual([
			{ code: "R1", text: "Keep it tight" },
			{ code: "R2", text: "Cite the source" },
		]);
	});

	it("reads a second bold span as the title", () => {
		const content =
			"## Rules\n\n- **R1** — **Keep it tight** — Around 30 lines, one line per point.\n";

		expect(parseRulesSection(content)).toEqual([
			{
				code: "R1",
				title: "Keep it tight",
				text: "Around 30 lines, one line per point.",
			},
		]);
	});

	it("treats a lone bold span after the code as the description", () => {
		expect(
			parseRulesSection("## Rules\n\n- **R1** — **Keep it tight**\n"),
		).toEqual([{ code: "R1", text: "**Keep it tight**" }]);
	});

	it("returns nothing when there is no Rules section", () => {
		expect(parseRulesSection("# Title\n\n- **R1** — Nope\n")).toEqual([]);
	});

	it("stops at the next heading", () => {
		const content = [
			"## Rules",
			"- **R1** — In scope",
			"",
			"## Writing summaries",
			"- **S1** — Out of scope",
		].join("\n");

		expect(parseRulesSection(content)).toEqual([
			{ code: "R1", text: "In scope" },
		]);
	});

	it("keeps bullets under a subheading of the Rules section", () => {
		const content = ["## Rules", "", "### Style", "- **R7** — Nested"].join(
			"\n",
		);

		expect(parseRulesSection(content)).toEqual([
			{ code: "R7", text: "Nested" },
		]);
	});

	it("ignores prose and malformed bullets", () => {
		const content = [
			"## Rules",
			"Some intro prose.",
			"- Not a rule",
			"- **R3**",
			"- **R4** — Real rule",
		].join("\n");

		expect(parseRulesSection(content)).toEqual([
			{ code: "R4", text: "Real rule" },
		]);
	});

	it("accepts hyphen and colon separators and CRLF line endings", () => {
		const content = "## Rules\r\n- **R5** - Hyphen\r\n- **R6**: Colon\r\n";

		expect(parseRulesSection(content)).toEqual([
			{ code: "R5", text: "Hyphen" },
			{ code: "R6", text: "Colon" },
		]);
	});
});
