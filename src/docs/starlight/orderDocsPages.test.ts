import { describe, expect, it } from "vitest";
import type { DocsPage } from "../docsPageSchema";
import { orderDocsPages } from "./orderDocsPages";

const page = (id: string, group: "Sessions" | "CLI", order: number) =>
	({ id, title: id, group, order, covers: [] }) satisfies DocsPage;

describe("orderDocsPages", () => {
	it("groups pages in nav order and leaves the landing page out", () => {
		const landing: DocsPage = {
			id: "index",
			title: "assist",
			template: "splash",
			hero: {},
			covers: [],
		};
		const groups = orderDocsPages([
			page("cli-run", "CLI", 0),
			landing,
			page("b", "Sessions", 1),
			page("a", "Sessions", 0),
		]);
		expect(groups).toEqual([
			{
				group: "Sessions",
				pages: [
					expect.objectContaining({ id: "a" }),
					expect.objectContaining({ id: "b" }),
				],
			},
			{ group: "CLI", pages: [expect.objectContaining({ id: "cli-run" })] },
		]);
	});
});
