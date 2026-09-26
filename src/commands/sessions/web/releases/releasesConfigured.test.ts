import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadConfigFrom = vi.fn();
const mockRespondJson = vi.fn();

vi.mock("../../../../shared/loadConfigFrom", () => ({
	loadConfigFrom: (cwd: string) => mockLoadConfigFrom(cwd),
}));

vi.mock("../../../../shared/web", () => ({
	respondJson: (...args: unknown[]) => mockRespondJson(...args),
}));

import { releasesConfigured } from "./releasesConfigured";

function run(url: string): unknown[] {
	releasesConfigured({ url } as IncomingMessage, {} as ServerResponse);
	return (mockRespondJson.mock.lastCall ?? []).slice(1);
}

describe("releasesConfigured", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("reports configured when releases.streams has an entry", () => {
		mockLoadConfigFrom.mockReturnValue({
			releases: { streams: [{ repo: "o/r" }] },
		});
		expect(run("/api/releases/configured?cwd=%2Frepo")).toEqual([
			200,
			{ configured: true },
		]);
		expect(mockLoadConfigFrom).toHaveBeenCalledWith("/repo");
	});

	it("reports not configured when releases.streams is empty", () => {
		mockLoadConfigFrom.mockReturnValue({ releases: { streams: [] } });
		expect(run("/api/releases/configured?cwd=%2Frepo")).toEqual([
			200,
			{ configured: false },
		]);
	});

	it("reports not configured when releases is absent", () => {
		mockLoadConfigFrom.mockReturnValue({});
		expect(run("/api/releases/configured?cwd=%2Frepo")).toEqual([
			200,
			{ configured: false },
		]);
	});

	it("responds 500 when the config cannot be read", () => {
		mockLoadConfigFrom.mockImplementation(() => {
			throw new Error("bad yaml");
		});
		expect(run("/api/releases/configured?cwd=%2Frepo")).toEqual([
			500,
			{ error: "bad yaml" },
		]);
	});

	it("responds 400 without a cwd", () => {
		expect(run("/api/releases/configured")).toEqual([
			400,
			{ error: "Missing cwd" },
		]);
		expect(mockLoadConfigFrom).not.toHaveBeenCalled();
	});
});
