import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { readSlackParts } from "./readSlackParts";

const mockExit = vi.spyOn(process, "exit").mockImplementation(() => {
	throw new Error("process.exit");
});
const mockError = vi.spyOn(console, "error").mockImplementation(() => {});

let dir: string;

beforeAll(() => {
	dir = mkdtempSync(join(tmpdir(), "slack-parts-"));
});

afterAll(() => {
	rmSync(dir, { recursive: true, force: true });
});

function part(name: string, contents: string): string {
	const path = join(dir, name);
	writeFileSync(path, contents);
	return path;
}

describe("readSlackParts", () => {
	it("reads every part in the order it was given", () => {
		const files = [
			part("a.md", "first\n"),
			part("b.md", "second\n"),
			part("c.md", "third\n"),
		];
		expect(readSlackParts(files)).toEqual(["first", "second", "third"]);
	});

	it("trims surrounding whitespace but keeps the body's own newlines", () => {
		expect(readSlackParts([part("multi.md", "\n\none\n\ntwo\n\n")])).toEqual([
			"one\n\ntwo",
		]);
	});

	it("errors on a missing part file", () => {
		expect(() => readSlackParts([join(dir, "nope.md")])).toThrow(
			"process.exit",
		);
		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockError).toHaveBeenCalledWith(
			expect.stringContaining("Part file not found"),
		);
	});

	it("errors on an empty part file", () => {
		expect(() => readSlackParts([part("blank.md", "   \n\n")])).toThrow(
			"process.exit",
		);
		expect(mockError).toHaveBeenCalledWith(
			expect.stringContaining("Part file is empty"),
		);
	});
});
