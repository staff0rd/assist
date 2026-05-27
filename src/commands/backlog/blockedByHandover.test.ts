import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { blockedByHandover } from "./blockedByHandover";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "blocked-by-handover-"));
}

function writeHandover(dir: string): void {
	const assistDir = join(dir, ".assist");
	mkdirSync(assistDir, { recursive: true });
	writeFileSync(join(assistDir, "HANDOVER.md"), "# Handover");
}

describe("blockedByHandover", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
	});

	it("returns false and logs nothing when no handover exists", () => {
		const dir = makeTempDir();

		expect(blockedByHandover(dir)).toBe(false);
		expect(logSpy).not.toHaveBeenCalled();
	});

	it("returns true and warns when a handover exists", () => {
		const dir = makeTempDir();
		writeHandover(dir);

		expect(blockedByHandover(dir)).toBe(true);
		expect(logSpy).toHaveBeenCalled();
	});
});
