import { beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();
vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

const mockGetCurrentPr = vi.fn();
vi.mock("./shared", () => ({
	getCurrentPr: () => mockGetCurrentPr(),
}));

vi.mock("../../shared/loadJson", () => ({
	loadJson: () => ({ site: "example.atlassian.net" }),
}));

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});

import { edit } from "./edit";

const EXISTING =
	"## What\n\nold what\n\n## Why\n\nold why\n\n## How\n\nold how";

beforeEach(() => {
	vi.clearAllMocks();
	mockGetCurrentPr.mockReturnValue({ number: 42, body: EXISTING });
});

describe("edit", () => {
	it("errors when no sections are supplied", () => {
		expect(() => edit({})).toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockExecSync).not.toHaveBeenCalled();
	});

	it("replaces only the supplied section, preserving the rest", () => {
		edit({ what: "new what" });

		expect(mockExecSync).toHaveBeenCalledWith(
			"gh pr edit 42 --body '## What\n\nnew what\n\n## Why\n\nold why\n\n## How\n\nold how'",
			{ stdio: "inherit" },
		);
	});

	it("updates the title without touching the body sections", () => {
		edit({ title: "feat: new title" });

		expect(mockExecSync).toHaveBeenCalledWith(
			"gh pr edit 42 --title 'feat: new title' --body '## What\n\nold what\n\n## Why\n\nold why\n\n## How\n\nold how'",
			{ stdio: "inherit" },
		);
	});

	it("rebuilds Why with resolved Jira URLs appended", () => {
		edit({ why: "new why", resolves: ["BAD-671"] });

		expect(mockExecSync).toHaveBeenCalledWith(
			expect.stringContaining(
				"## Why\n\nnew why\n\nResolves https://example.atlassian.net/browse/BAD-671",
			),
			{ stdio: "inherit" },
		);
	});

	it("appends resolves to the existing Why when only --resolves is given", () => {
		edit({ resolves: ["BAD-671"] });

		expect(mockExecSync).toHaveBeenCalledWith(
			expect.stringContaining(
				"## Why\n\nold why\n\nResolves https://example.atlassian.net/browse/BAD-671",
			),
			{ stdio: "inherit" },
		);
	});

	it("preserves the existing Resolves line when editing Why prose without --resolves", () => {
		mockGetCurrentPr.mockReturnValue({
			number: 42,
			body: "## Why\n\nold why\n\nResolves https://example.atlassian.net/browse/BAD-1",
		});

		edit({ why: "new why" });

		const body = mockExecSync.mock.calls[0][0] as string;
		expect(body).toContain(
			"## Why\n\nnew why\n\nResolves https://example.atlassian.net/browse/BAD-1",
		);
	});

	it("replaces an existing Resolves line rather than duplicating it", () => {
		mockGetCurrentPr.mockReturnValue({
			number: 42,
			body: "## Why\n\nold why\n\nResolves https://example.atlassian.net/browse/BAD-1",
		});

		edit({ resolves: ["BAD-2"] });

		const body = mockExecSync.mock.calls[0][0] as string;
		expect(body).toContain(
			"Resolves https://example.atlassian.net/browse/BAD-2",
		);
		expect(body).not.toContain("BAD-1");
	});

	it("adds a section that does not yet exist", () => {
		mockGetCurrentPr.mockReturnValue({
			number: 42,
			body: "## What\n\nold what\n\n## Why\n\nold why",
		});

		edit({ how: "new how" });

		expect(mockExecSync).toHaveBeenCalledWith(
			expect.stringContaining("## How\n\nnew how"),
			{ stdio: "inherit" },
		);
	});

	it("rejects content that references Claude", () => {
		expect(() => edit({ what: "built by Claude" })).toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockExecSync).not.toHaveBeenCalled();
	});

	it("exits with code 1 when gh fails", () => {
		mockExecSync.mockImplementation(() => {
			throw new Error("gh failed");
		});

		expect(() => edit({ what: "new what" })).toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
	});
});
