import { describe, expect, it, vi } from "vitest";

const placePrMock = vi.fn();
const requestPrDecisionMock = vi.fn();
vi.mock("./placePr", () => ({
	placePr: (...args: unknown[]) => placePrMock(...args),
}));
vi.mock("./requestPrDecision", () => ({
	requestPrDecision: (...args: unknown[]) => requestPrDecisionMock(...args),
}));

import { previewAndPlace } from "./previewAndPlace";

const args = {
	sessionId: "s",
	title: "t",
	body: "## What\n\nx",
	prNumber: null,
	options: {},
};

describe("previewAndPlace", () => {
	it("appends approved screenshots under a ## Screenshots section", async () => {
		requestPrDecisionMock.mockResolvedValue({
			decision: "approve",
			screenshots: ["![a](u1)", "![b](u2)"],
		});

		await previewAndPlace(args);

		expect(placePrMock).toHaveBeenCalledWith(
			null,
			"t",
			"## What\n\nx\n\n## Screenshots\n\n![a](u1)\n\n![b](u2)",
			{},
		);
	});

	it("leaves the body untouched when there are no screenshots", async () => {
		requestPrDecisionMock.mockResolvedValue({ decision: "approve" });

		await previewAndPlace(args);

		expect(placePrMock).toHaveBeenCalledWith(null, "t", "## What\n\nx", {});
	});
});
