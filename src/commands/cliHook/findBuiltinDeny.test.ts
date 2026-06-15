import { describe, expect, it } from "vitest";
import { findBuiltinDeny, findBuiltinDenyRaw } from "./findBuiltinDeny";

describe("findBuiltinDeny gh pr edit", () => {
	it("denies a leading 'gh pr edit' with a redirect to 'assist prs edit'", () => {
		const decision = findBuiltinDeny(["gh pr edit 89 --body-file body.md"]);
		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("assist prs edit");
	});

	it("denies a bare 'gh pr edit'", () => {
		const decision = findBuiltinDeny(["gh pr edit"]);
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("denies 'gh pr edit' buried in a compound command part", () => {
		const decision = findBuiltinDeny([
			"cd /repo",
			"gh pr edit 89 --body 'updated'",
		]);
		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("assist prs edit");
	});

	it("does not deny an unrelated gh command", () => {
		expect(findBuiltinDeny(["gh pr view 89"])).toBeUndefined();
	});
});

describe("findBuiltinDenyRaw gh pr edit", () => {
	it("denies 'gh pr edit' buried in a raw command the prefix path can't decompose", () => {
		const decision = findBuiltinDenyRaw(
			"gh pr edit 89 --body-file - <<'EOF'\nbody with `code`\nEOF",
		);
		expect(decision?.permissionDecision).toBe("deny");
		expect(decision?.permissionDecisionReason).toContain("assist prs edit");
	});

	it("denies 'gh pr edit' that is not the leading token", () => {
		const decision = findBuiltinDenyRaw("cd /repo && gh pr edit 89 --title x");
		expect(decision?.permissionDecision).toBe("deny");
	});

	it("does not deny an unrelated raw gh command", () => {
		expect(findBuiltinDenyRaw("gh pr view 89")).toBeUndefined();
	});
});
