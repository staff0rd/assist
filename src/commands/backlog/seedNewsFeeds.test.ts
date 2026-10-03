import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import {
	loadGlobalConfigRaw,
	loadProjectConfig,
} from "../../shared/loadConfig";
import { addFeed } from "./addFeed";
import { listFeeds } from "./listFeeds";
import { seedNewsFeeds } from "./seedNewsFeeds";

const mockLoadProjectConfig = vi.mocked(loadProjectConfig);
const mockLoadGlobalConfigRaw = vi.mocked(loadGlobalConfigRaw);

let orm: Db;
let close: () => Promise<void>;

describe("seedNewsFeeds", () => {
	beforeEach(async () => {
		vi.clearAllMocks();
		mockLoadProjectConfig.mockReturnValue({});
		mockLoadGlobalConfigRaw.mockReturnValue({});
		({ orm, close } = await createTestDb());
	});

	afterEach(async () => {
		await close();
	});

	it("seeds legacy global feeds into an empty table", async () => {
		mockLoadGlobalConfigRaw.mockReturnValue({
			news: { feeds: ["https://a.example/feed", "https://b.example/feed"] },
		});
		await seedNewsFeeds(orm);
		expect(await listFeeds(orm)).toEqual([
			"https://a.example/feed",
			"https://b.example/feed",
		]);
	});

	it("prefers project feeds over global feeds", async () => {
		mockLoadProjectConfig.mockReturnValue({
			news: { feeds: ["https://project.example/feed"] },
		});
		mockLoadGlobalConfigRaw.mockReturnValue({
			news: { feeds: ["https://global.example/feed"] },
		});
		await seedNewsFeeds(orm);
		expect(await listFeeds(orm)).toEqual(["https://project.example/feed"]);
	});

	it("does nothing when the table already has feeds", async () => {
		await addFeed(orm, "https://existing.example/feed");
		mockLoadGlobalConfigRaw.mockReturnValue({
			news: { feeds: ["https://a.example/feed"] },
		});
		await seedNewsFeeds(orm);
		expect(await listFeeds(orm)).toEqual(["https://existing.example/feed"]);
	});

	it("does nothing when config lists no feeds", async () => {
		await seedNewsFeeds(orm);
		expect(await listFeeds(orm)).toEqual([]);
	});
});
