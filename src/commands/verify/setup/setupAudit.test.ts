import { describe, expect, it, vi } from "vitest";

const mockAddToKnipIgnoreBinaries = vi.fn();

vi.mock("../addToKnipIgnoreBinaries", () => ({
	addToKnipIgnoreBinaries: (...args: unknown[]) =>
		mockAddToKnipIgnoreBinaries(...args),
}));

import { getSetupHandlers } from "../init/getSetupHandlers";

describe("audit setup handler", () => {
	it("writes the verify:audit run entry", async () => {
		const writer = vi.fn();
		const handlers = getSetupHandlers(false, false, false);

		await handlers.audit("/repo/package.json", writer);

		expect(writer).toHaveBeenCalledWith("verify:audit", "assist verify audit");
		expect(mockAddToKnipIgnoreBinaries).toHaveBeenCalledWith("/repo", "assist");
	});
});
