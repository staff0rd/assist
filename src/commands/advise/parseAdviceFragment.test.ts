import { describe, expect, it } from "vitest";
import { parseAdviceFragment } from "./parseAdviceFragment";

describe("parseAdviceFragment", () => {
	it("splits frontmatter from the body", () => {
		const fragment = parseAdviceFragment(
			"markdown",
			"---\ntitle: Writing markdown\nwhen: always\n---\n\nDo not hard-wrap.\n",
		);

		expect(fragment).toEqual({
			name: "markdown",
			title: "Writing markdown",
			when: "always",
			body: "Do not hard-wrap.",
		});
	});

	it("rejects a fragment with no frontmatter", () => {
		expect(() => parseAdviceFragment("bare", "Do not hard-wrap.")).toThrow(
			"has no frontmatter",
		);
	});

	it("rejects a fragment missing its condition", () => {
		expect(() =>
			parseAdviceFragment("untitled", "---\ntitle: Something\n---\n\nBody.\n"),
		).toThrow("needs a title and a when condition");
	});
});
