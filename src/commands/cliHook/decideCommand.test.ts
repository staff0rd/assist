import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMatchesConfigDeny = vi.fn();
const mockIsApprovedRead = vi.fn();

vi.mock("../../shared/matchesConfigDeny", () => ({
	matchesConfigDeny: (cmd: string) => mockMatchesConfigDeny(cmd),
}));

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: (cmd: string, toolName?: string) =>
		mockIsApprovedRead(cmd, toolName),
}));

vi.mock("../../shared/matchesAllow", () => ({
	matchesDeny: () => undefined,
}));

import { decideCommand } from "./decideCommand";

beforeEach(() => {
	vi.clearAllMocks();
	mockMatchesConfigDeny.mockReturnValue(undefined);
	mockIsApprovedRead.mockReturnValue(undefined);
});

describe("decideCommand truncation denies", () => {
	it("denies an approval-gated command piped to tail", () => {
		const decision = decideCommand(
			"Bash",
			'assist backlog comment a972 "review findings" | tail -20',
		);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist backlog comment",
		);
	});

	it("denies backlog show piped to head", () => {
		const decision = decideCommand(
			"Bash",
			"assist backlog show a972 | head -20",
		);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist backlog comments",
		);
	});

	it("denies a gated command in a raw command that cannot be split", () => {
		const decision = decideCommand(
			"Bash",
			"assist github issue create --title `x` --body y | tail -20",
		);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain(
			"assist github issue create",
		);
	});

	it("does not deny a gated command whose quoted body mentions piping to tail", () => {
		expect(
			decideCommand(
				"Bash",
				'assist backlog comment a972 "denied when piped as | tail -20"',
			),
		).toBeUndefined();
	});

	it("does not deny a gated body documenting a head pipeline over multiple lines", () => {
		expect(
			decideCommand(
				"Bash",
				'assist backlog comment a972 "line one\n\nrepro: run it | head -5"',
			),
		).toBeUndefined();
	});
});
