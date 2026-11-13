import { describe, expect, it } from "vitest";
import { linkPrompt } from "./linkPrompt";

const PR = "https://github.com/org/repo/pull/12";

describe("linkPrompt", () => {
	it("uses an issue link alone as the prompt", () => {
		expect(linkPrompt("https://github.com/org/repo/issues/7", undefined)).toBe(
			"https://github.com/org/repo/issues/7",
		);
	});

	it("appends trimmed instructions after a non-PR link", () => {
		expect(linkPrompt("https://example.com/x", "  fix it ")).toBe(
			"https://example.com/x\n\nfix it",
		);
	});

	it("tells the agent to read a PR remotely before the question", () => {
		expect(linkPrompt(PR, "why the retry?")).toBe(
			`${PR}\n\nThis is a pull request. Read it remotely with \`gh pr view ${PR} --comments\` and \`gh pr diff ${PR}\`; do not check out its branch.\n\nwhy the retry?`,
		);
	});

	it("recognises a PR link with a sub-page or anchor", () => {
		expect(linkPrompt(`${PR}/files#diff-1`, undefined)).toContain(
			`\`gh pr diff ${PR}\``,
		);
	});
});
