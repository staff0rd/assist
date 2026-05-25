import {
	existsSync,
	mkdirSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { archive } from "./archive";

function makeTempDir(): string {
	return mkdtempSync(join(tmpdir(), "handover-archive-"));
}

function writeHandover(dir: string, content = "old handover"): string {
	const assistDir = join(dir, ".assist");
	mkdirSync(assistDir, { recursive: true });
	const path = join(assistDir, "HANDOVER.md");
	writeFileSync(path, content);
	return path;
}

describe("archive", () => {
	it("should be a no-op when no handover exists", () => {
		const dir = makeTempDir();
		const result = archive({ cwd: dir });
		expect(result).toBeUndefined();
		expect(existsSync(join(dir, ".assist", "handovers"))).toBe(false);
	});

	it("should move HANDOVER.md to the archive directory with an ISO timestamp", () => {
		const dir = makeTempDir();
		const handoverPath = writeHandover(dir, "session 1");
		const now = new Date(Date.UTC(2026, 4, 25, 14, 30, 22));

		const result = archive({ cwd: dir, now });

		expect(result).toBe(
			join(dir, ".assist", "handovers", "archive", "2026-05-25T143022Z.md"),
		);
		expect(existsSync(handoverPath)).toBe(false);
		expect(readFileSync(result as string, "utf-8")).toBe("session 1");
	});

	it("should append the suffix when provided", () => {
		const dir = makeTempDir();
		writeHandover(dir);
		const now = new Date(Date.UTC(2026, 4, 25, 14, 30, 22));

		const result = archive({ cwd: dir, now, suffix: "manual" });

		expect(result).toBe(
			join(
				dir,
				".assist",
				"handovers",
				"archive",
				"2026-05-25T143022Z-manual.md",
			),
		);
	});

	it("should add a collision counter when the destination already exists", () => {
		const dir = makeTempDir();
		const now = new Date(Date.UTC(2026, 4, 25, 14, 30, 22));
		const archiveDir = join(dir, ".assist", "handovers", "archive");
		mkdirSync(archiveDir, { recursive: true });
		writeFileSync(join(archiveDir, "2026-05-25T143022Z.md"), "existing");

		writeHandover(dir, "new");
		const result = archive({ cwd: dir, now });

		expect(result).toBe(join(archiveDir, "2026-05-25T143022Z-1.md"));
	});

	it("should add a collision counter onto a custom suffix", () => {
		const dir = makeTempDir();
		const now = new Date(Date.UTC(2026, 4, 25, 14, 30, 22));
		const archiveDir = join(dir, ".assist", "handovers", "archive");
		mkdirSync(archiveDir, { recursive: true });
		writeFileSync(join(archiveDir, "2026-05-25T143022Z-manual.md"), "existing");

		writeHandover(dir, "new");
		const result = archive({ cwd: dir, now, suffix: "manual" });

		expect(result).toBe(join(archiveDir, "2026-05-25T143022Z-manual-1.md"));
	});
});
