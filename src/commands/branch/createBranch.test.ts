import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => ({}),
}));

vi.mock("./resolveDefaultBranch", () => ({
	resolveDefaultBranch: (override?: string) => override ?? "main",
}));

vi.mock("../../shared/resolveSessionItemId", () => ({
	resolveSessionItemId: () => null,
}));

vi.mock("../../shared/db/recordSessionRefs", () => ({
	recordSessionRefs: vi.fn(),
}));

import { createBranch } from "./createBranch";

function commandsRun(): string[] {
	return mockExecSync.mock.calls.map((call) => String(call[0]));
}

describe("createBranch", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("bases off the fresh remote default when --from is omitted", async () => {
		const result = await createBranch({ slug: "add-login-form" });

		expect(result).toEqual({
			branchName: "add-login-form",
			baseRef: "origin/main",
		});
		const commands = commandsRun();
		expect(commands).toContain("git fetch");
		expect(commands).toContain("git switch -c add-login-form origin/main");
	});

	it("bases off <ref> verbatim after validating it", async () => {
		const result = await createBranch({
			slug: "stacked-work",
			from: "feature/base",
		});

		expect(result).toEqual({
			branchName: "stacked-work",
			baseRef: "feature/base",
		});
		const commands = commandsRun();
		expect(commands).toContain("git fetch");
		expect(commands).toContain("git rev-parse --verify feature/base");
		expect(commands).toContain("git switch -c stacked-work feature/base");
	});

	it("fetches before validating so remote refs are current", async () => {
		await createBranch({ slug: "stacked-work", from: "origin/some-branch" });

		const commands = commandsRun();
		expect(commands.indexOf("git fetch")).toBeLessThan(
			commands.indexOf("git rev-parse --verify origin/some-branch"),
		);
	});

	it("throws a clear error and creates no branch when --from does not resolve", async () => {
		mockExecSync.mockImplementation((command: string) => {
			if (command.startsWith("git rev-parse")) {
				throw new Error("fatal: Needed a single revision");
			}
			return "";
		});

		await expect(
			createBranch({ slug: "stacked-work", from: "nope" }),
		).rejects.toThrow('Ref "nope" does not resolve to a valid git ref');

		expect(commandsRun()).not.toContain("git switch -c stacked-work nope");
	});
});
