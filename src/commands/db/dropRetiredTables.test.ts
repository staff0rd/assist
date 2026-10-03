import type { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyMigrations } from "../../shared/db/migrations/applyMigrations";
import { pgliteExecutor } from "../../shared/db/migrations/MigrationExecutor";
import { findRetiredTables } from "../../shared/db/retired/findRetiredTables";
import { sharedTestPglite } from "../../shared/db/sharedTestPglite";

const mockPromptConfirm = vi.fn();

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: (...args: unknown[]) => mockPromptConfirm(...args),
}));

import { dropRetiredTables } from "./dropRetiredTables";

describe("dropRetiredTables", () => {
	let db: PGlite;

	beforeEach(async () => {
		mockPromptConfirm.mockReset();
		vi.spyOn(console, "log").mockImplementation(() => {});
		db = await sharedTestPglite();
		await applyMigrations(pgliteExecutor(db));
		await db.exec(
			"INSERT INTO handovers (origin, summary, content) VALUES ('o', 's', 'c')",
		);
	});

	it("drops the table after the user confirms a prompt showing its row count", async () => {
		mockPromptConfirm.mockResolvedValue(true);
		await dropRetiredTables(pgliteExecutor(db));
		expect(mockPromptConfirm.mock.calls[0][0]).toContain("handovers (1 rows)");
		expect(await findRetiredTables(pgliteExecutor(db))).toEqual([]);
	});

	it("keeps the table when the user declines", async () => {
		mockPromptConfirm.mockResolvedValue(false);
		await dropRetiredTables(pgliteExecutor(db));
		expect(await findRetiredTables(pgliteExecutor(db))).toEqual([
			{ name: "handovers", rows: 1 },
		]);
	});

	it("does not prompt when no retired table exists", async () => {
		await db.exec("DROP TABLE handovers");
		await dropRetiredTables(pgliteExecutor(db));
		expect(mockPromptConfirm).not.toHaveBeenCalled();
	});
});
