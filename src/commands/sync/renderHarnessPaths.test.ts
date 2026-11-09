import { describe, expect, it } from "vitest";
import { harnesses } from "../../shared/harnesses";
import { renderHarnessPaths } from "./renderHarnessPaths";

const SOURCE =
	"Read `{{design.systemPrompt}}`, then `{{design.skill}}`; see `/design` (`{{skill:design}}`).";

describe("renderHarnessPaths", () => {
	it("keeps the existing Claude paths", () => {
		expect(renderHarnessPaths(SOURCE, harnesses.claude)).toBe(
			"Read `~/.claude/design-system-prompt.md`, then `~/.claude/skills/<name>.md`; see `/design` (`~/.claude/skills/design/SKILL.md`).",
		);
	});

	it("points Codex at its own synced resources", () => {
		expect(renderHarnessPaths(SOURCE, harnesses.codex)).toBe(
			"Read `~/.codex/assist/design-system-prompt.md`, then `~/.codex/skills/<name>/SKILL.md`; see `/design` (`~/.codex/skills/design/SKILL.md`).",
		);
	});

	it("points pi at its own synced resources", () => {
		expect(renderHarnessPaths(SOURCE, harnesses.pi)).toBe(
			"Read `~/.pi/agent/assist/design-system-prompt.md`, then `~/.pi/agent/assist/design-skills/<name>.md`; see `/design` (`~/.pi/agent/prompts/design.md`).",
		);
	});

	it("leaves text without tokens unchanged", () => {
		expect(renderHarnessPaths("plain {{other}}", harnesses.codex)).toBe(
			"plain {{other}}",
		);
	});
});
