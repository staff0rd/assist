import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { readUserConfigCache } from "../../shared/readUserConfigCache";
import { configSet } from "./configSet";
import { configUnset } from "./configUnset";

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

function captureExit() {
	const errors = vi.spyOn(console, "error").mockImplementation(() => {});
	const exit = vi.spyOn(process, "exit").mockImplementation(() => {
		throw new Error("exit");
	});
	return { errors, exit };
}

describe("config set/unset --user", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		vi.restoreAllMocks();
		vi.spyOn(console, "log").mockImplementation(() => {});
	});

	it("writes the key to user (db) and refreshes the local cache", async () => {
		await configSet("commit.push", "true", { user: true });

		expect(await readUserConfig(orm)).toEqual({ commit: { push: true } });
		expect(readUserConfigCache()).toEqual({ commit: { push: true } });
	});

	it("stacks keys into the existing user (db) config", async () => {
		await configSet("commit.push", "true", { user: true });
		await configSet("commit.pull", "true", { user: true });

		expect(await readUserConfig(orm)).toEqual({
			commit: { push: true, pull: true },
		});
	});

	it.each([
		["database.url", "postgres://x"],
		["sync.autoConfirm", "true"],
	])("rejects the node-only key %s, naming user (node)", async (key, value) => {
		const { errors } = captureExit();

		await expect(configSet(key, value, { user: true })).rejects.toThrow("exit");

		expect(String(errors.mock.calls[0]?.[0])).toContain("user (node)");
		expect(await readUserConfig(orm)).toEqual({});
	});

	it("rejects --user combined with --node", async () => {
		captureExit();

		await expect(
			configSet("commit.push", "true", { user: true, node: true }),
		).rejects.toThrow("exit");
	});

	it("unsets the key and clears the row once empty", async () => {
		await configSet("commit.push", "true", { user: true });

		await configUnset("commit.push", { user: true });

		expect(await readUserConfig(orm)).toEqual({});
		expect(readUserConfigCache()).toEqual({});
	});
});
