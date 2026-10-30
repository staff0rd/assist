import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { readUserConfig } from "../../shared/db/readUserConfig";
import { updateUserConfig } from "../../shared/db/updateUserConfig";
import { loadGlobalConfigRaw, saveGlobalConfig } from "../../shared/loadConfig";
import { readUserConfigCache } from "../../shared/readUserConfigCache";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { configImportUser } from "./configImportUser";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

const mockPromptConfirm = vi.fn<() => Promise<boolean>>();

vi.mock("../../shared/promptConfirm", () => ({
	promptConfirm: () => mockPromptConfirm(),
}));

let orm: Db;

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

const mockLoadGlobalConfigRaw = vi.mocked(loadGlobalConfigRaw);
const mockSaveGlobalConfig = vi.mocked(saveGlobalConfig);
let log: ReturnType<typeof vi.spyOn>;
const printed = () => log.mock.calls.flat().join("\n");
const rule = (title: string) => ({ title, text: `${title} text` });

async function seedUserDb(config: Record<string, unknown>): Promise<void> {
	await updateUserConfig(orm, () => ({ ok: true, config, result: undefined }));
}

describe("configImportUser", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		vi.clearAllMocks();
		log = vi.spyOn(console, "log").mockImplementation(() => undefined);
		mockLoadGlobalConfigRaw.mockReturnValue({
			commit: { push: true },
			advice: { extra: "Be brief", rules: [rule("shared"), rule("local")] },
		});
	});

	it("shows only the rules user (db) lacks", async () => {
		await seedUserDb({ advice: { rules: [rule("shared")] } });
		mockPromptConfirm.mockResolvedValue(false);

		await configImportUser([]);

		expect(printed()).toContain('+ advice.rules[]: {"title":"local"');
		expect(printed()).not.toContain('"title":"shared"');
	});

	it("writes nothing when the user declines", async () => {
		mockPromptConfirm.mockResolvedValue(false);

		await configImportUser([]);

		expect(await readUserConfig(orm)).toEqual({});
		expect(mockSaveGlobalConfig).not.toHaveBeenCalled();
	});

	it("appends the missing rules, refreshes the cache and removes them from ~/.assist.yml", async () => {
		await seedUserDb({ advice: { rules: [rule("shared")] } });
		mockPromptConfirm.mockResolvedValue(true);

		await configImportUser([]);

		const expected = {
			advice: { rules: [rule("shared"), rule("local")] },
		};
		expect(await readUserConfig(orm)).toEqual(expected);
		expect(readUserConfigCache()).toEqual(expected);
		expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
			commit: { push: true },
			advice: { extra: "Be brief" },
		});
	});

	it("imports the chosen scalar keys", async () => {
		await seedUserDb({ commit: { push: false } });
		mockPromptConfirm.mockResolvedValue(true);

		await configImportUser(["commit.push"]);

		expect(printed()).toContain("~ commit.push: false → true");
		expect(await readUserConfig(orm)).toEqual({ commit: { push: true } });
		expect(mockSaveGlobalConfig).toHaveBeenCalledWith({
			advice: { extra: "Be brief", rules: [rule("shared"), rule("local")] },
		});
	});

	it("rejects node-only keys naming user (node)", async () => {
		const errors = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation(() => {
			throw new Error("exit");
		});

		await expect(configImportUser(["database.url"])).rejects.toThrow("exit");

		expect(errors.mock.calls.flat().join("\n")).toContain("user (node)");
		expect(mockPromptConfirm).not.toHaveBeenCalled();
	});
});
