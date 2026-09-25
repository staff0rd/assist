import { describe, expect, it } from "vitest";
import { wrapCollapsed } from "./wrapCollapsed";

describe("wrapCollapsed", () => {
	it("wraps the line holding the selection in a details block", () => {
		const body = "## What\n\nAdds x to the thing";

		expect(wrapCollapsed(body, "Adds x")).toBe(
			"## What\n\n<details>\n<summary>Click to expand</summary>\n\nAdds x to the thing\n\n</details>",
		);
	});

	it("wraps a whole section when the selection spans blocks", () => {
		const body =
			"# Title\n\nintro\n\n# History\n\nlots of noise\n\n# Next\n\ntail";

		expect(wrapCollapsed(body, "History\nlots of noise")).toBe(
			[
				"# Title",
				"",
				"intro",
				"",
				"<details>",
				"<summary>Click to expand</summary>",
				"",
				"# History",
				"",
				"lots of noise",
				"",
				"</details>",
				"",
				"# Next",
				"",
				"tail",
			].join("\n"),
		);
	});

	it("picks the tightest window rather than the earliest start", () => {
		const body = "# History\n\nfirst\n\nsecond";

		expect(wrapCollapsed(body, "second")).toBe(
			"# History\n\nfirst\n\n<details>\n<summary>Click to expand</summary>\n\nsecond\n\n</details>",
		);
	});

	it("matches through markdown syntax the pane strips out", () => {
		const body = "- **bold** item and [a link](https://example.com/x)";

		expect(wrapCollapsed(body, "bold item and a link")).toBe(
			`<details>\n<summary>Click to expand</summary>\n\n${body}\n\n</details>`,
		);
	});

	it("leaves the body alone when the quote cannot be located", () => {
		const body = "## What\n\nAdds x";

		expect(wrapCollapsed(body, "nothing like this")).toBe(body);
		expect(wrapCollapsed(body, "   ")).toBe(body);
	});
});
