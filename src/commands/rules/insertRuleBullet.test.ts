import { describe, expect, it } from "vitest";
import { insertRuleBullet } from "./insertRuleBullet";

describe("insertRuleBullet", () => {
	it("appends after the last bullet in an existing section", () => {
		const content =
			"# Doc\n\n## Rules\n\n- **R1** — First\n- **R2** — Second\n";

		expect(insertRuleBullet(content, { code: "R3", text: "Third" })).toBe(
			"# Doc\n\n## Rules\n\n- **R1** — First\n- **R2** — Second\n- **R3** — Third\n",
		);
	});

	it("writes the title as a second bold span", () => {
		expect(
			insertRuleBullet("## Rules\n\n- **R1** — First\n", {
				code: "R2",
				title: "Keep it tight",
				text: "Around 30 lines, one line per point.",
			}),
		).toBe(
			"## Rules\n\n- **R1** — First\n- **R2** — **Keep it tight** — Around 30 lines, one line per point.\n",
		);
	});

	it("creates the section when the file has none", () => {
		expect(
			insertRuleBullet("# Doc\n\nGuidance.\n", { code: "R1", text: "First" }),
		).toBe("# Doc\n\nGuidance.\n\n## Rules\n\n- **R1** — First\n");
	});

	it("creates the section in an empty file", () => {
		expect(insertRuleBullet("", { code: "R1", text: "First" })).toBe(
			"## Rules\n\n- **R1** — First\n",
		);
	});

	it("keeps content that follows the section", () => {
		const content = "## Rules\n\n- **R1** — First\n\n## Other\n\nText.\n";

		expect(insertRuleBullet(content, { code: "R2", text: "Second" })).toBe(
			"## Rules\n\n- **R1** — First\n- **R2** — Second\n\n## Other\n\nText.\n",
		);
	});

	it("inserts before trailing prose when the section has no bullets", () => {
		const content = "## Rules\n\nNothing yet.\n";

		expect(insertRuleBullet(content, { code: "R1", text: "First" })).toBe(
			"## Rules\n\n- **R1** — First\n\nNothing yet.\n",
		);
	});
});
