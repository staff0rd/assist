import {
	existsSync,
	mkdtempSync,
	rmSync,
	utimesSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

let restrictedDir: string;

vi.mock("../codeComment/getRestrictedDir", () => ({
	getRestrictedDir: () => restrictedDir,
}));

import { consumeMigrationApproval } from "./consumeMigrationApproval";
import { getMigrationApprovalPath } from "./getMigrationPinPath";

function seedApproval(migrationId: number, ageMs = 0): string {
	const path = getMigrationApprovalPath(migrationId);
	writeFileSync(path, JSON.stringify({ migrationId }));
	if (ageMs > 0) {
		const seconds = (Date.now() - ageMs) / 1000;
		utimesSync(path, seconds, seconds);
	}
	return path;
}

describe("consumeMigrationApproval", () => {
	beforeEach(() => {
		restrictedDir = mkdtempSync(join(tmpdir(), "assist-consume-"));
	});

	afterEach(() => {
		rmSync(restrictedDir, { recursive: true, force: true });
	});

	it("consumes and removes a matching approval token exactly once", () => {
		const path = seedApproval(8);

		expect(consumeMigrationApproval(8)).toBe(true);
		expect(existsSync(path)).toBe(false);
		expect(consumeMigrationApproval(8)).toBe(false);
	});

	it("does not unlock a different migration id", () => {
		const path = seedApproval(8);

		expect(consumeMigrationApproval(9)).toBe(false);
		expect(existsSync(path)).toBe(true);
	});

	it("does not unlock with a stale token (swept before use)", () => {
		const path = seedApproval(8, 31 * 60 * 1000);

		expect(consumeMigrationApproval(8)).toBe(false);
		expect(existsSync(path)).toBe(false);
	});

	it("returns false when no approval exists", () => {
		expect(consumeMigrationApproval(8)).toBe(false);
	});
});
