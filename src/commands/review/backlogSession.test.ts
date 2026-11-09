import { describe, expect, it, vi } from "vitest";
import type { HarnessAdapter } from "../../shared/harnessAdapters/types";
import { backlogSession, buildBacklogArgs } from "./backlogSession";

const PATH = "/repo/review/synthesis.md";

describe("buildBacklogArgs", () => {
	it("should name the synthesis path", () => {
		expect(buildBacklogArgs(PATH)).toMatch(
			/^add each finding in \/repo\/review\/synthesis\.md as a phase/,
		);
	});

	it("should instruct one item with every finding as a phase", () => {
		const args = buildBacklogArgs(PATH);

		expect(args).toContain("ONE bug backlog item");
		expect(args).toContain("EVERY finding");
		expect(args).toContain("already-raised");
	});

	it("should route the plan through a single update-plan call", () => {
		const args = buildBacklogArgs(PATH);

		expect(args).toContain("assist backlog update-plan <id> --json -");
		expect(args).toContain("Do not run `assist backlog add-phase` per finding");
	});

	it("should instruct leaving the synthesis file untouched", () => {
		expect(buildBacklogArgs(PATH)).toContain(
			`Do not edit ${PATH} — leave it untouched.`,
		);
	});
});

describe("backlogSession", () => {
	it("should launch the native /bug skill with edits allowed", () => {
		const launchSkill = vi.fn(() => ({ done: Promise.resolve(0) }));
		const adapter = { launchSkill } as unknown as HarnessAdapter;

		backlogSession.launch(adapter, PATH);

		expect(launchSkill).toHaveBeenCalledWith("bug", buildBacklogArgs(PATH), {
			cwd: process.cwd(),
			allowEdits: true,
		});
	});
});
