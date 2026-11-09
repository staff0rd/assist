import { describe, expect, it } from "vitest";
import { setFrontmatterSlack } from "./setFrontmatterSlack";

const permalink = "https://x.slack.com/archives/C1/p1712345678123456";

const entry =
	'---\nproject: "yoke"\nadded:\n  - text: "slack: not a key"\n---\n\nLede with --- inside.\n';

describe("setFrontmatterSlack", () => {
	it("appends slack to the frontmatter and leaves the rest unchanged", () => {
		expect(setFrontmatterSlack(entry, permalink)).toBe(
			`---\nproject: "yoke"\nadded:\n  - text: "slack: not a key"\nslack: "${permalink}"\n---\n\nLede with --- inside.\n`,
		);
	});

	it("replaces an existing top-level slack line", () => {
		const skipped =
			'---\nproject: "yoke"\nslack: "skipped"\nweek: "2026-W43"\n---\n\nLede.\n';
		expect(setFrontmatterSlack(skipped, permalink)).toBe(
			`---\nproject: "yoke"\nslack: "${permalink}"\nweek: "2026-W43"\n---\n\nLede.\n`,
		);
	});

	it("returns null when there is no frontmatter", () => {
		expect(setFrontmatterSlack("Just text.\n", permalink)).toBeNull();
	});
});
