import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockPromptConfirm = vi.fn();
vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

import { createSyncFiles } from "./createSyncFiles";

describe("createSyncFiles", () => {
	let dir: string;

	beforeEach(() => {
		vi.spyOn(console, "log").mockImplementation(() => {});
		mockPromptConfirm.mockReset();
		dir = mkdtempSync(join(tmpdir(), "assist-sync-files-"));
	});

	afterEach(() => {
		rmSync(dir, { recursive: true, force: true });
		vi.restoreAllMocks();
	});

	it("adopts an existing file whose content already matches", async () => {
		const target = join(dir, "skill.md");
		writeFileSync(target, "SAME");
		const files = createSyncFiles([]);

		files.write(target, "SAME");
		await files.finish(false);

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(files.owns(target)).toBe(true);
	});

	it("overwrites an unowned file only once confirmed, prompting default no", async () => {
		const target = join(dir, "skill.md");
		writeFileSync(target, "MINE");
		mockPromptConfirm.mockResolvedValue(true);
		const files = createSyncFiles([]);

		files.write(target, "ASSIST");
		expect(readFileSync(target, "utf8")).toBe("MINE");
		await files.finish(false);

		expect(mockPromptConfirm).toHaveBeenCalledWith(expect.any(String), false);
		expect(readFileSync(target, "utf8")).toBe("ASSIST");
		expect(files.owns(target)).toBe(true);
	});

	it("skips unowned files without prompting under --yes", async () => {
		const target = join(dir, "notes.md");
		writeFileSync(target, "MINE");
		const files = createSyncFiles([]);

		files.remove(target, ["ASSIST"]);
		await files.finish(true);

		expect(mockPromptConfirm).not.toHaveBeenCalled();
		expect(readFileSync(target, "utf8")).toBe("MINE");
	});

	it("records written files in the manifest for the next sync", async () => {
		const target = join(dir, "skills", "x", "SKILL.md");
		mkdirSync(dir, { recursive: true });
		const files = createSyncFiles([]);

		files.write(target, "ASSIST");
		await files.finish(true);

		expect(createSyncFiles().owns(target)).toBe(true);
	});
});
