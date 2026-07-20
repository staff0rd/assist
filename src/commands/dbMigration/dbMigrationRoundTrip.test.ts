import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockShowNotification = vi.fn();
let restrictedDir: string;

vi.mock("../notify/showNotification", () => ({
	showNotification: (...args: unknown[]) => mockShowNotification(...args),
}));

vi.mock("../codeComment/getRestrictedDir", () => ({
	getRestrictedDir: () => restrictedDir,
}));

import { getRestrictedDir } from "../codeComment/getRestrictedDir";
import { decideMigrationGuard } from "../editHook/decideMigrationGuard";
import { dbMigrationConfirm } from "./dbMigrationConfirm";
import { dbMigrationUnlock } from "./dbMigrationUnlock";
import { getMigrationPinPath } from "./getMigrationPinPath";
import { nextMigrationId } from "./nextMigrationId";

function migrationPath(id: number): string {
	const padded = String(id).padStart(4, "0");
	return `src/shared/db/migrations/migration${padded}Feature.ts`;
}

function writeInput(id: number) {
	return {
		tool_name: "Write",
		tool_input: {
			file_path: migrationPath(id),
			content: "export const m = {};\n",
		},
	};
}

function issuedPin(): string {
	const files = readdirSync(restrictedDir).filter((f) =>
		f.startsWith("db-migration-pin-"),
	);
	return files[0].replace("db-migration-pin-", "").replace(".json", "");
}

describe("db-migration unlock -> confirm -> write round-trip", () => {
	let logSpy: ReturnType<typeof vi.spyOn>;
	let errorSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		process.exitCode = undefined;
		restrictedDir = mkdtempSync(join(tmpdir(), "assist-migration-"));
		mockShowNotification.mockReturnValue(true);
		logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
		errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		logSpy.mockRestore();
		errorSpy.mockRestore();
		process.exitCode = undefined;
		rmSync(restrictedDir, { recursive: true, force: true });
	});

	it("allows an approved new-migration write exactly once", () => {
		const id = nextMigrationId();

		expect(decideMigrationGuard(writeInput(id), undefined)).toContain(
			"db-migration unlock",
		);

		dbMigrationUnlock();
		expect(mockShowNotification).toHaveBeenCalledTimes(1);
		const pin = issuedPin();

		dbMigrationConfirm(pin);
		expect(process.exitCode).toBeUndefined();

		expect(decideMigrationGuard(writeInput(id), undefined)).toBeUndefined();

		expect(decideMigrationGuard(writeInput(id), undefined)).toContain(
			"db-migration unlock",
		);
	});

	it("scopes the approval to a single migration id", () => {
		const id = nextMigrationId();

		dbMigrationUnlock();
		dbMigrationConfirm(issuedPin());

		expect(decideMigrationGuard(writeInput(id + 1), undefined)).toContain(
			"db-migration unlock",
		);
		expect(decideMigrationGuard(writeInput(id), undefined)).toBeUndefined();
	});

	it("rejects confirm for an unknown pin", () => {
		dbMigrationConfirm("999");
		expect(process.exitCode).toBe(1);
	});

	it("rejects confirm for a corrupt pin file (invalid migration id)", () => {
		writeFileSync(
			getMigrationPinPath("321"),
			JSON.stringify({ pin: "321", migrationId: "not-a-number" }),
		);

		dbMigrationConfirm("321");

		expect(process.exitCode).toBe(1);
	});

	it("uses the mocked restricted dir", () => {
		expect(getRestrictedDir()).toBe(restrictedDir);
	});
});
