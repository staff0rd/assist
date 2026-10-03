import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as fsMockModule from "../../test/mocks/fsMock";
import { codeCommentConfirm } from "./codeCommentConfirm";

vi.mock("node:fs", async () =>
	(
		await vi.importActual<typeof fsMockModule>("../../test/mocks/fsMock")
	).fsMock(),
);

const mockExistsSync = vi.mocked(existsSync);
const mockReadFileSync = vi.mocked(readFileSync);
const mockWriteFileSync = vi.mocked(writeFileSync);
const mockUnlinkSync = vi.mocked(unlinkSync);

vi.mock("./getRestrictedDir", () => ({
	getPinStatePath: (pin: string) => `/pins/${pin}.json`,
}));

vi.mock("./sweepRestrictedDir", () => ({
	sweepRestrictedDir: vi.fn(),
}));

describe("codeCommentConfirm", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	function primePin(file: string, line: number, text: string): void {
		const pinPath = "/pins/123.json";
		mockExistsSync.mockImplementation(
			(path) => path === pinPath || path === file,
		);
		mockReadFileSync.mockImplementation((path) => {
			if (path === pinPath) {
				return JSON.stringify({ pin: "123", file, line, text });
			}
			return "root:\n  child: value\n";
		});
	}

	function writtenContent(): string {
		return String(mockWriteFileSync.mock.calls[0][1]);
	}

	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		errorSpy.mockRestore();
		process.exitCode = undefined;
	});

	it("inserts a # comment for a .yml pin", () => {
		primePin("config.yml", 2, "explains the override");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  # explains the override");
		expect(mockUnlinkSync).toHaveBeenCalledWith("/pins/123.json");
	});

	it("inserts a // comment for a .ts pin", () => {
		primePin("src/foo.ts", 2, "guards the edge case");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  // guards the edge case");
	});

	it("inserts a # comment for a Dockerfile pin", () => {
		primePin("Dockerfile", 2, "pins the base image digest");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("# pins the base image digest");
	});

	it("inserts a // comment for a .bicep pin", () => {
		primePin("infra/main.bicep", 2, "documents the sku choice");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  // documents the sku choice");
	});

	it("inserts a // comment for a .cs pin", () => {
		primePin("src/Program.cs", 2, "guards a nullable edge case");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  // guards a nullable edge case");
	});

	it("inserts a // comment for a .rs pin", () => {
		primePin("src/main.rs", 2, "keeps the borrow alive");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain("  // keeps the borrow alive");
	});

	it("inserts a # comment for a below-header .sh pin", () => {
		primePin("deploy.sh", 2, "retry accounts for eventual consistency");

		codeCommentConfirm("123");

		expect(writtenContent()).toContain(
			"# retry accounts for eventual consistency",
		);
	});
});
