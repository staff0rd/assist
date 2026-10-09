import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
	afterEach,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";

const mockExecFileSync = vi.mocked(execFileSync);
vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockGetCurrentPr = vi.fn();
vi.mock("./shared", () => ({
	getCurrentPr: () => mockGetCurrentPr(),
}));

const mockRequestPreviewDecision = vi.fn();
vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
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

const GH_OPTIONS = { encoding: "utf8", stdio: ["inherit", "pipe", "inherit"] };

beforeEach(() => {
	vi.clearAllMocks();
	mockExecFileSync.mockReset().mockReturnValue("");
	mockGetCurrentPr.mockReturnValue({
		number: 42,
		title: "fix: current title",
		body: EXISTING,
	});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("edit", () => {
	it("errors when no sections are supplied", async () => {
		await expect(edit({})).rejects.toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockExecFileSync).not.toHaveBeenCalled();
	});

	it("replaces only the supplied section, preserving the rest", async () => {
		await edit({ what: "new what" });

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"pr",
				"edit",
				"42",
				"--body",
				"## What\n\nnew what\n\n## Why\n\nold why\n\n## How\n\nold how",
			],
			GH_OPTIONS,
		);
	});

	it("updates the title without touching the body sections", async () => {
		await edit({ title: "feat: new title" });

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			[
				"pr",
				"edit",
				"42",
				"--title",
				"feat: new title",
				"--body",
				"## What\n\nold what\n\n## Why\n\nold why\n\n## How\n\nold how",
			],
			GH_OPTIONS,
		);
	});

	it("rebuilds Why with resolved Jira URLs appended", async () => {
		await edit({ why: "new why", resolves: ["BAD-671"] });

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining([
				expect.stringContaining(
					"## Why\n\nnew why\n\nResolves https://example.atlassian.net/browse/BAD-671",
				),
			]),
			GH_OPTIONS,
		);
	});

	it("appends resolves to the existing Why when only --resolves is given", async () => {
		await edit({ resolves: ["BAD-671"] });

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining([
				expect.stringContaining(
					"## Why\n\nold why\n\nResolves https://example.atlassian.net/browse/BAD-671",
				),
			]),
			GH_OPTIONS,
		);
	});

	it("preserves the existing Resolves line when editing Why prose without --resolves", async () => {
		mockGetCurrentPr.mockReturnValue({
			number: 42,
			title: "fix: current title",
			body: "## Why\n\nold why\n\nResolves https://example.atlassian.net/browse/BAD-1",
		});

		await edit({ why: "new why" });

		const body = (mockExecFileSync.mock.calls[0][1] as string[]).at(
			-1,
		) as string;
		expect(body).toContain(
			"## Why\n\nnew why\n\nResolves https://example.atlassian.net/browse/BAD-1",
		);
	});

	it("replaces an existing Resolves line rather than duplicating it", async () => {
		mockGetCurrentPr.mockReturnValue({
			number: 42,
			title: "fix: current title",
			body: "## Why\n\nold why\n\nResolves https://example.atlassian.net/browse/BAD-1",
		});

		await edit({ resolves: ["BAD-2"] });

		const body = (mockExecFileSync.mock.calls[0][1] as string[]).at(
			-1,
		) as string;
		expect(body).toContain(
			"Resolves https://example.atlassian.net/browse/BAD-2",
		);
		expect(body).not.toContain("BAD-1");
	});

	it("adds a section that does not yet exist", async () => {
		mockGetCurrentPr.mockReturnValue({
			number: 42,
			title: "fix: current title",
			body: "## What\n\nold what\n\n## Why\n\nold why",
		});

		await edit({ how: "new how" });

		expect(mockExecFileSync).toHaveBeenCalledWith(
			"gh",
			expect.arrayContaining([expect.stringContaining("## How\n\nnew how")]),
			GH_OPTIONS,
		);
	});

	it("rejects content that references Claude", async () => {
		await expect(edit({ what: "built by Claude" })).rejects.toThrow(
			"process.exit",
		);
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockExecFileSync).not.toHaveBeenCalled();
	});

	it("exits with code 1 when gh fails", async () => {
		mockExecFileSync.mockImplementation(() => {
			throw new Error("gh failed");
		});

		await expect(edit({ what: "new what" })).rejects.toThrow("process.exit");
		expect(mockExit).toHaveBeenCalledWith(1);
	});

	describe("--screenshot", () => {
		let dir: string;
		beforeAll(() => {
			dir = mkdtempSync(join(tmpdir(), "edit-screenshot-"));
			writeFileSync(join(dir, "a.png"), "");
		});

		it("replaces the existing ## Screenshots section and attaches the file", async () => {
			mockGetCurrentPr.mockReturnValue({
				number: 42,
				title: "fix: current title",
				body: "## What\n\nw\n\n## Screenshots\n\n![old](https://x/old.png)",
			});
			const path = join(dir, "a.png");

			await edit({ screenshot: [`Profile/Light=${path}`] });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				[
					"pr",
					"edit",
					"42",
					"--body",
					`## What\n\nw\n\n## Screenshots\n\n### Profile\n\n| Light |  |\n| --- | --- |\n| ![Light](${path}) |  |`,
					"--attach",
					path,
				],
				{ encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] },
			);
		});

		it("exits naming the spec before calling gh when the file is missing", async () => {
			const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

			await expect(edit({ screenshot: ["X=nope.png"] })).rejects.toThrow(
				"process.exit",
			);

			expect(mockGetCurrentPr).not.toHaveBeenCalled();
			expect(mockExecFileSync).not.toHaveBeenCalled();
			expect(errorSpy.mock.calls.at(-1)?.[0]).toContain("'X=nope.png'");
		});
	});

	it("does not preview when a session id is missing", async () => {
		process.env.ASSIST_SESSION = "1";

		await edit({ what: "new what" });

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(mockExecFileSync).toHaveBeenCalled();
	});

	describe("inside a session", () => {
		const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		beforeEach(() => {
			process.env.ASSIST_SESSION = "1";
			process.env.ASSIST_SESSION_ID = "sess-1";
			logSpy.mockClear();
			errorSpy.mockClear();
		});

		afterEach(() => {
			logSpy.mockClear();
			errorSpy.mockClear();
		});

		it("previews the current title when --title is omitted", async () => {
			mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

			await edit({ what: "new what" });

			expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
				expect.objectContaining({
					sessionId: "sess-1",
					title: "fix: current title",
					body: "## What\n\nnew what\n\n## Why\n\nold why\n\n## How\n\nold how",
					prNumber: 42,
				}),
			);
		});

		it("previews the new title when --title is supplied", async () => {
			mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

			await edit({ title: "feat: new title" });

			expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
				expect.objectContaining({ title: "feat: new title" }),
			);
		});

		it("applies the edit once the preview is approved", async () => {
			mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

			await edit({ what: "new what" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				[
					"pr",
					"edit",
					"42",
					"--body",
					"## What\n\nnew what\n\n## Why\n\nold why\n\n## How\n\nold how",
				],
				GH_OPTIONS,
			);
		});

		it("references and attaches screenshots pasted into the preview pane", async () => {
			mockRequestPreviewDecision.mockResolvedValue({
				decision: "approve",
				screenshots: [
					{ path: "/s/a.png", alt: "a" },
					{ path: "/s/b.mp4", alt: "b" },
				],
			});

			await edit({ what: "new what" });

			expect(mockExecFileSync).toHaveBeenCalledWith(
				"gh",
				[
					"pr",
					"edit",
					"42",
					"--body",
					"## What\n\nnew what\n\n## Why\n\nold why\n\n## How\n\nold how\n\n## Screenshots\n\n| a |  |\n| --- | --- |\n| ![a](/s/a.png) |  |\n\n![b](/s/b.mp4)",
					"--attach",
					"/s/a.png",
					"--attach",
					"/s/b.mp4",
				],
				{ encoding: "utf8", stdio: ["inherit", "pipe", "pipe"] },
			);
		});

		it("prints the reviewer's comments and exits without touching the PR on reject", async () => {
			mockRequestPreviewDecision.mockResolvedValue({
				decision: "reject",
				comments: [{ quote: "new what", note: "be specific" }],
			});

			await expect(edit({ what: "new what" })).rejects.toThrow("process.exit");

			expect(mockExit).toHaveBeenCalledWith(1);
			expect(mockExecFileSync).not.toHaveBeenCalled();
			const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
			expect(output).toContain("be specific");
		});
	});
});
