import { beforeEach, describe, expect, it, vi } from "vitest";

const mockMatchesConfigDeny = vi.fn();
const mockMatchesDeny = vi.fn();
const mockIsApprovedRead = vi.fn();

vi.mock("../../shared/matchesConfigDeny", () => ({
	matchesConfigDeny: (cmd: string) => mockMatchesConfigDeny(cmd),
}));

vi.mock("../../shared/matchesAllow", () => ({
	matchesDeny: (_tool: string, cmd: string) => mockMatchesDeny(cmd),
}));

vi.mock("../../shared/isApprovedRead", () => ({
	isApprovedRead: (cmd: string, tool: string) => mockIsApprovedRead(cmd, tool),
}));

import { findDeny, resolvePermission } from "./resolvePermission";

beforeEach(() => {
	vi.clearAllMocks();
	mockMatchesConfigDeny.mockReturnValue(undefined);
	mockMatchesDeny.mockReturnValue(undefined);
	mockIsApprovedRead.mockReturnValue(undefined);
});

describe("built-in gh pr create deny", () => {
	it("denies a bare 'gh pr create'", () => {
		const decision = findDeny("Bash", ["gh pr create"]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("assist prs create");
	});

	it("denies 'gh pr create' with flags", () => {
		const decision = findDeny("Bash", [
			'gh pr create --title "feat: x" --body "y"',
		]);

		expect(decision?.permissionDecision).toBe("deny");
	});

	it("denies a compound command containing 'gh pr create'", () => {
		const decision = findDeny("Bash", [
			"git push -u origin HEAD",
			"gh pr create --fill",
		]);

		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("assist prs create");
	});

	it("applies even when settings would allow the command", () => {
		mockIsApprovedRead.mockReturnValue("Allowed by settings");

		const decision = resolvePermission("Bash", ["gh pr create --web"]);

		expect(decision?.permissionDecision).toBe("deny");
	});

	it("does not deny other gh pr sub-commands", () => {
		expect(findDeny("Bash", ["gh pr view"])).toBeUndefined();
		expect(findDeny("Bash", ["gh pr list"])).toBeUndefined();
	});

	it("does not deny 'assist prs create'", () => {
		expect(
			findDeny("Bash", ["assist prs create --title t --body b"]),
		).toBeUndefined();
	});

	it("does not deny commands merely containing the words", () => {
		expect(findDeny("Bash", ["echo gh pr created"])).toBeUndefined();
	});
});
