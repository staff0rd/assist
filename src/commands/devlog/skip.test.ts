import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { listRepoConfigs } from "../../shared/db/listRepoConfigs";
import { seedRepoConfigs } from "../../test/mothers/seedRepoConfigs";
import { skip } from "./skip";

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("../backlog/getCurrentOrigin", () => ({
	getCurrentOrigin: () => "github.com/org/assist",
}));

beforeEach(async () => {
	({ orm } = await createTestDb());
	vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("skip", () => {
	it("writes the week to the current repo's repo (db) override", async () => {
		await skip("2026-W33");

		expect(await listRepoConfigs(orm)).toEqual({
			"github.com/org/assist": { devlog: { skipWeeks: ["2026-W33"] } },
		});
	});

	it("keeps the list sorted alongside other repo keys", async () => {
		await seedRepoConfigs(orm, {
			assist: {
				devlog: { skipWeeks: ["2026-W10", "2026-W40"], name: "assist" },
			},
		});

		await skip("2026-W33");

		expect(await listRepoConfigs(orm)).toEqual({
			assist: {
				devlog: {
					skipWeeks: ["2026-W10", "2026-W33", "2026-W40"],
					name: "assist",
				},
			},
		});
	});

	it("leaves the list unchanged when the week is already skipped", async () => {
		await seedRepoConfigs(orm, {
			assist: { devlog: { skipWeeks: ["2026-W33"] } },
		});

		await skip("2026-W33");

		expect(await listRepoConfigs(orm)).toEqual({
			assist: { devlog: { skipWeeks: ["2026-W33"] } },
		});
	});

	it("exits non-zero for an invalid week and writes nothing", async () => {
		const exit = vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("exit");
		});

		await expect(skip("2026-33")).rejects.toThrow("exit");

		expect(exit).toHaveBeenCalledWith(1);
		expect(await listRepoConfigs(orm)).toEqual({});
	});
});
