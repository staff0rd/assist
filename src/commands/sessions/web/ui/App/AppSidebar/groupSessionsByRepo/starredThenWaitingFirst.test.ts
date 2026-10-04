import { describe, expect, it } from "vitest";
import { starredThenWaitingFirst } from "./starredThenWaitingFirst";

type Item = {
	id: string;
	starred?: boolean;
	waiting?: boolean;
};

const item = (id: string, flags: Omit<Item, "id"> = {}): Item => ({
	id,
	...flags,
});

function order(items: Item[]): string[] {
	return starredThenWaitingFirst(
		items,
		(i) => i.starred === true,
		(i) => i.waiting === true,
	).map((i) => i.id);
}

describe("starredThenWaitingFirst", () => {
	it("orders starred, then waiting, then the rest", () => {
		const items = [
			item("plain"),
			item("waiting", { waiting: true }),
			item("starred", { starred: true }),
		];

		expect(order(items)).toEqual(["starred", "waiting", "plain"]);
	});

	it("keeps a starred waiter in the starred tier", () => {
		const items = [
			item("waiting", { waiting: true }),
			item("starredWaiting", { starred: true, waiting: true }),
		];

		expect(order(items)).toEqual(["starredWaiting", "waiting"]);
	});

	it("preserves the given order within a tier", () => {
		const items = [item("a"), item("b"), item("c"), item("d")];

		expect(order(items)).toEqual(["a", "b", "c", "d"]);
	});
});
