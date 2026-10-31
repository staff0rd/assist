import { mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { itemGitRefs, items } from "../../shared/db/schema";

const mockShowNotification = vi.fn<(...args: unknown[]) => boolean>();
let restrictedDir: string;
let orm: Db;

vi.mock("../notify/showNotification", () => ({
	showNotification: (...args: unknown[]) => mockShowNotification(...args),
}));

vi.mock("../codeComment/getRestrictedDir", () => ({
	getRestrictedDir: () => restrictedDir,
}));

vi.mock("../backlog/docsRefreshAfter", () => ({
	docsRefreshAfter: () => 5,
}));

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
	closeDb: () => Promise.resolve(),
}));

vi.mock("../backlog/shared", () => ({
	findOneItem: async (id: string) => {
		const [item] = await orm
			.select()
			.from(items)
			.where(eq(items.id, Number(id)));
		return item ? { orm, item } : undefined;
	},
}));

import { isDocsLocked } from "../backlog/isDocsLocked";
import { docsConfirm } from "./docsConfirm";
import { docsUnlock } from "./docsUnlock";
import { getDocsUnlockPinPath } from "./getDocsUnlockPinPath";

const ENV = "ASSIST_BACKLOG_ITEM_ID";

async function addStory(name: string): Promise<number> {
	const [row] = await orm
		.insert(items)
		.values({ origin: "github.com/acme/app", name, status: "in-progress" })
		.returning({ id: items.id });
	return row.id;
}

function issuedPins(): string[] {
	return readdirSync(restrictedDir)
		.filter((f) => f.startsWith("docs-unlock-pin-"))
		.map((f) => f.replace("docs-unlock-pin-", "").replace(".json", ""));
}

function unlockRefs() {
	return orm
		.select()
		.from(itemGitRefs)
		.where(eq(itemGitRefs.kind, "docs-unlock"));
}

describe("docs unlock -> confirm round-trip", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		restrictedDir = mkdtempSync(join(tmpdir(), "assist-docs-unlock-"));
		mockShowNotification.mockReturnValue(true);
		process.exitCode = undefined;
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		delete process.env[ENV];
		process.exitCode = undefined;
		rmSync(restrictedDir, { recursive: true, force: true });
	});

	it("unlocks docs for the session's item once its pin is confirmed", async () => {
		const id = await addStory("Docs landing page");
		process.env[ENV] = String(id);
		expect(await isDocsLocked()).toBe(true);

		await docsUnlock();
		expect(mockShowNotification).toHaveBeenCalledWith(
			expect.objectContaining({
				title: expect.stringContaining(`a${id} Docs landing page`),
			}),
		);
		expect(await isDocsLocked()).toBe(true);

		const [pin] = issuedPins();
		await docsConfirm(pin);

		expect(process.exitCode).toBeUndefined();
		expect(issuedPins()).toEqual([]);
		expect(await unlockRefs()).toEqual([
			expect.objectContaining({ itemId: id, ref: "approved" }),
		]);
		expect(await isDocsLocked()).toBe(false);
	});

	it("fails without a session item", async () => {
		await docsUnlock();
		expect(process.exitCode).toBe(1);
		expect(mockShowNotification).not.toHaveBeenCalled();
		expect(issuedPins()).toEqual([]);
	});

	it("fails and discards the pin when the notification is not delivered", async () => {
		process.env[ENV] = String(await addStory("Docs landing page"));
		mockShowNotification.mockReturnValue(false);

		await docsUnlock();

		expect(process.exitCode).toBe(1);
		expect(issuedPins()).toEqual([]);
	});

	it("rejects an unknown pin without approving anything", async () => {
		process.env[ENV] = String(await addStory("Docs landing page"));
		await docsUnlock();

		await docsConfirm("unknown");

		expect(process.exitCode).toBe(1);
		expect(await unlockRefs()).toEqual([]);
	});

	it("rejects a corrupt pin file", async () => {
		writeFileSync(
			getDocsUnlockPinPath("321"),
			JSON.stringify({ pin: "321", itemId: "nope" }),
		);

		await docsConfirm("321");

		expect(process.exitCode).toBe(1);
		expect(await unlockRefs()).toEqual([]);
	});
});
