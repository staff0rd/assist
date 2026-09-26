import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { readLogTail } from "./readLogTail";

let dir: string;

function logFile(content: string): string {
	dir = mkdtempSync(join(tmpdir(), "log-tail-"));
	const path = join(dir, "daemon.log");
	writeFileSync(path, content);
	return path;
}

afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe("readLogTail", () => {
	it("returns the last n lines without the trailing empty line", () => {
		expect(readLogTail(logFile("a\nb\nc\n"), 2)).toEqual(["b", "c"]);
	});

	it("returns every line when fewer than n exist", () => {
		expect(readLogTail(logFile("a\nb"), 10)).toEqual(["a", "b"]);
	});

	it("returns nothing for a missing file", () => {
		dir = mkdtempSync(join(tmpdir(), "log-tail-"));
		expect(readLogTail(join(dir, "missing.log"), 5)).toEqual([]);
	});
});
