import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockRefreshAfter = vi.fn<() => number | undefined>();
const mockRequestDocsRefresh = vi.fn();

vi.mock("./docsRefreshAfter", () => ({
	docsRefreshAfter: () => mockRefreshAfter(),
}));

vi.mock("./requestDocsRefresh", () => ({
	requestDocsRefresh: (...args: unknown[]) => mockRequestDocsRefresh(...args),
}));

vi.mock("./shared", () => ({
	getOrigin: () => "github.com/acme/app",
	getReady: () => Promise.resolve({ orm: {} }),
}));

import { refreshDocs } from "./refreshDocs";

describe("refreshDocs", () => {
	beforeEach(() => {
		process.exitCode = undefined;
		vi.spyOn(console, "log").mockImplementation(() => {});
		vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		process.exitCode = undefined;
		vi.restoreAllMocks();
		mockRequestDocsRefresh.mockReset();
	});

	it("refuses with a config hint and creates nothing when docs.refreshAfter is unset", async () => {
		mockRefreshAfter.mockReturnValue(undefined);

		await refreshDocs();

		expect(process.exitCode).toBe(1);
		expect(mockRequestDocsRefresh).not.toHaveBeenCalled();
		expect(vi.mocked(console.error).mock.calls[0][0]).toContain(
			"assist config set docs.refreshAfter",
		);
	});

	it("creates a Refresh docs item when docs.refreshAfter is set", async () => {
		mockRefreshAfter.mockReturnValue(5);
		mockRequestDocsRefresh.mockResolvedValue({ outcome: "created", id: 42 });

		await refreshDocs();

		expect(process.exitCode).toBeUndefined();
		expect(mockRequestDocsRefresh).toHaveBeenCalledWith(
			{},
			"github.com/acme/app",
		);
	});
});
