import { beforeEach, describe, expect, it, vi } from "vitest";

const mockLoadJson = vi.fn();
vi.mock("../../shared/loadJson", () => ({
	loadJson: (...args: unknown[]) => mockLoadJson(...args),
}));

import { buildPrBody } from "./buildPrBody";

beforeEach(() => {
	vi.clearAllMocks();
	mockLoadJson.mockReturnValue({ site: "example.atlassian.net" });
});

describe("buildPrBody", () => {
	it("renders What and Why sections", () => {
		const body = buildPrBody({ what: "Does a thing", why: "It was needed" });

		expect(body).toBe("## What\n\nDoes a thing\n\n## Why\n\nIt was needed");
	});

	it("omits How when not supplied", () => {
		const body = buildPrBody({ what: "x", why: "y" });

		expect(body).not.toContain("## How");
	});

	it("includes How when supplied", () => {
		const body = buildPrBody({ what: "x", why: "y", how: "by doing z" });

		expect(body).toBe("## What\n\nx\n\n## Why\n\ny\n\n## How\n\nby doing z");
	});

	it("appends resolved Jira URLs inline within Why", () => {
		const body = buildPrBody({
			what: "x",
			why: "y",
			resolves: ["BAD-671", "BAD-672"],
		});

		expect(body).toContain(
			"## Why\n\ny\n\nResolves https://example.atlassian.net/browse/BAD-671, https://example.atlassian.net/browse/BAD-672",
		);
	});

	it("falls back to the bare key when no Jira site is configured", () => {
		mockLoadJson.mockReturnValue({});

		const body = buildPrBody({ what: "x", why: "y", resolves: ["BAD-671"] });

		expect(body).toContain("Resolves BAD-671");
	});
});
