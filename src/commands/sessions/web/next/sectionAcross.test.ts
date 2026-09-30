import { describe, expect, it } from "vitest";
import { sectionAcross } from "./sectionAcross";

type Item = { url: string };

const item = (url: string): Item => ({ url });
const byUrl = (a: Item, b: Item) => a.url.localeCompare(b.url);

describe("sectionAcross", () => {
	it("merges every repo's items into one sorted list", async () => {
		const section = await sectionAcross(
			["o/a", "o/b"],
			async (repo) => (repo === "o/a" ? [item("3"), item("1")] : [item("2")]),
			byUrl,
		);
		expect(section).toEqual({
			items: [item("1"), item("2"), item("3")],
			error: null,
		});
	});

	it("lists an item once when an owner and one of its repos both return it", async () => {
		const section = await sectionAcross(
			["o", "o/a"],
			async () => [item("1")],
			byUrl,
		);
		expect(section.items).toEqual([item("1")]);
	});

	it("keeps other repos' items when one repo fails", async () => {
		const section = await sectionAcross(
			["o/a", "o/b"],
			async (repo) => {
				if (repo === "o/b")
					throw Object.assign(new Error("exit 1"), { stderr: "not found\n" });
				return [item("1")];
			},
			byUrl,
		);
		expect(section).toEqual({ items: [item("1")], error: "o/b: not found" });
	});

	it("names the key to set when there is no repo to read", async () => {
		const section = await sectionAcross([], async () => [item("1")], byUrl);
		expect(section.items).toEqual([]);
		expect(section.error).toMatch(/set next\.repos/);
	});
});
