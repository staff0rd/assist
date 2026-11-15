import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { MigrationStatus } from "./getMigrationStatus";
import type { MigrationExecutor } from "./MigrationExecutor";

const statusMock = vi.fn<() => Promise<MigrationStatus>>();
vi.mock("./getMigrationStatus", () => ({
	getMigrationStatus: () => statusMock(),
}));

import { assertMigrationsInSync } from "./assertMigrationsInSync";

const exec = {} as MigrationExecutor;

describe("assertMigrationsInSync", () => {
	let warn: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		warn = vi.spyOn(console, "warn").mockImplementation(() => {});
	});

	afterEach(() => {
		warn.mockRestore();
		statusMock.mockReset();
	});

	it("passes silently when in sync", async () => {
		statusMock.mockResolvedValue({ state: "in-sync", version: 12 });
		await expect(assertMigrationsInSync(exec)).resolves.toBeUndefined();
		expect(warn).not.toHaveBeenCalled();
	});

	it("still fails when the database is behind", async () => {
		statusMock.mockResolvedValue({
			state: "behind",
			applied: 11,
			expected: 12,
			pending: [12],
		});
		await expect(assertMigrationsInSync(exec)).rejects.toThrow(
			"Assist database is behind this build (applied migration 11, build expects 12)",
		);
		expect(warn).not.toHaveBeenCalled();
	});

	it("warns once and continues when the database is ahead", async () => {
		statusMock.mockResolvedValue({ state: "ahead", applied: 13, expected: 12 });
		await expect(assertMigrationsInSync(exec)).resolves.toBeUndefined();
		await expect(assertMigrationsInSync(exec)).resolves.toBeUndefined();
		expect(warn).toHaveBeenCalledTimes(1);
		expect(String(warn.mock.calls[0][0])).toContain(
			"ahead of this build (applied migration 13, build knows 12)",
		);
	});
});
