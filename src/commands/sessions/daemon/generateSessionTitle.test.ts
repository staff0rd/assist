import { execFile } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

import { generateSessionTitle } from "./generateSessionTitle";

const mockExecFile = vi.mocked(execFile);

type ExecFileCallback = (e: unknown, r: unknown) => void;

function respondWith(error: unknown, result: unknown): void {
	mockExecFile.mockImplementation(((
		_file: string,
		_args: string[],
		_opts: unknown,
		cb: ExecFileCallback,
	) => {
		cb(error, result);
	}) as never);
}

function resolveWith(stdout: string): void {
	respondWith(null, { stdout, stderr: "" });
}

function rejectWith(error: Error): void {
	respondWith(error, null);
}

describe("generateSessionTitle", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("asks haiku for a title and returns the trimmed suggestion", async () => {
		resolveWith("Fix login redirect\n");

		expect(await generateSessionTitle("the login page redirects wrong")).toBe(
			"Fix login redirect",
		);
		expect(mockExecFile).toHaveBeenCalledWith(
			"claude",
			expect.arrayContaining(["-p", "--model", "haiku"]),
			expect.objectContaining({ encoding: "utf8", timeout: 30_000 }),
			expect.any(Function),
		);
	});

	it("strips wrapping quotes", async () => {
		resolveWith('"Add dark mode"');

		expect(await generateSessionTitle("add dark mode")).toBe("Add dark mode");
	});

	it("strips trailing punctuation", async () => {
		resolveWith("Add dark mode.");

		expect(await generateSessionTitle("add dark mode")).toBe("Add dark mode");
	});

	it("keeps only the first line", async () => {
		resolveWith("Add dark mode\nHere is why I chose that title.");

		expect(await generateSessionTitle("add dark mode")).toBe("Add dark mode");
	});

	it("handles carriage returns in the output", async () => {
		resolveWith('"Add dark mode"\r\nexplanation\r\n');

		expect(await generateSessionTitle("add dark mode")).toBe("Add dark mode");
	});

	it("caps the title so a card never wraps", async () => {
		resolveWith("a".repeat(200));

		const title = await generateSessionTitle("something long");

		expect(title).toHaveLength(48);
	});

	it("returns undefined when the claude CLI fails", async () => {
		rejectWith(new Error("spawn claude ENOENT"));

		expect(await generateSessionTitle("add dark mode")).toBeUndefined();
	});

	it("returns undefined when the call times out", async () => {
		rejectWith(Object.assign(new Error("timeout"), { killed: true }));

		expect(await generateSessionTitle("add dark mode")).toBeUndefined();
	});

	it("returns undefined when nothing usable comes back", async () => {
		resolveWith("  \n  ");

		expect(await generateSessionTitle("add dark mode")).toBeUndefined();
	});
});
