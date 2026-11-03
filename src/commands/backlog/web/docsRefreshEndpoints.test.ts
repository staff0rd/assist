import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../../shared/db/createTestDb";
import type { Db } from "../../../shared/db/Db";
import { items } from "../../../shared/db/schema";

const ORIGIN = "github.com/acme/app";
const mockRefreshAfter = vi.fn<() => number | undefined>();
let orm: Db;

vi.mock("../docsRefreshAfter", () => ({
	docsRefreshAfter: () => mockRefreshAfter(),
}));
vi.mock("../hasDocsCoverageRun", () => ({ hasDocsCoverageRun: () => false }));
vi.mock("./applyCwdFromReq", () => ({ applyCwdFromReq: vi.fn() }));
vi.mock("../shared", () => ({
	getOrigin: () => ORIGIN,
	getReady: async () => ({ orm }),
}));

import { getDocsRefresh } from "./getDocsRefresh";
import { postDocsRefresh } from "./postDocsRefresh";

function makeReqRes() {
	const req = { url: "/api/backlog/docs-refresh" } as IncomingMessage;
	const writeHead = vi.fn();
	let sent = "";
	const res = {
		writeHead,
		end: vi.fn((chunk?: string) => {
			if (chunk) sent = chunk;
		}),
	} as unknown as ServerResponse;
	return {
		req,
		res,
		status: () => writeHead.mock.calls[0][0] as number,
		json: () => JSON.parse(sent) as Record<string, unknown>,
	};
}

async function itemCount(): Promise<number> {
	return (await orm.select({ id: items.id }).from(items)).length;
}

describe("docs-refresh endpoints", () => {
	beforeEach(async () => {
		({ orm } = await createTestDb());
		await orm
			.insert(items)
			.values({ origin: ORIGIN, type: "story", name: "Story", status: "done" });
	});

	it("reports enabled when docs.refreshAfter is set", async () => {
		mockRefreshAfter.mockReturnValue(5);
		const { req, res, json } = makeReqRes();

		await getDocsRefresh(req, res);

		expect(json()).toMatchObject({
			enabled: true,
			unswept: [{ name: "Story" }],
		});
	});

	it("reports disabled when docs.refreshAfter is unset", async () => {
		mockRefreshAfter.mockReturnValue(undefined);
		const { req, res, json } = makeReqRes();

		await getDocsRefresh(req, res);

		expect(json().enabled).toBe(false);
	});

	it("refuses to create an item when docs.refreshAfter is unset", async () => {
		mockRefreshAfter.mockReturnValue(undefined);
		const { req, res, status, json } = makeReqRes();

		await postDocsRefresh(req, res);

		expect(status()).toBe(409);
		expect(json().error).toContain("assist config set docs.refreshAfter");
		expect(await itemCount()).toBe(1);
	});

	it("creates an item when docs.refreshAfter is set", async () => {
		mockRefreshAfter.mockReturnValue(5);
		const { req, res, status, json } = makeReqRes();

		await postDocsRefresh(req, res);

		expect(status()).toBe(200);
		expect(json().outcome).toBe("created");
		expect(await itemCount()).toBe(2);
	});
});
