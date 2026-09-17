import { describe, expect, it } from "vitest";
import { starredThenWaitingFirst } from "./starredThenWaitingFirst";

type Item = {
	id: string;
	starred?: boolean;
	watcher?: boolean;
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
		(i) => i.watcher === true,
	).map((i) => i.id);
}

describe("starredThenWaitingFirst", () => {
	it("orders starred, then watcher, then waiting, then the rest", () => {
		const items = [
			item("plain"),
			item("waiting", { waiting: true }),
			item("watcher", { watcher: true }),
			item("starred", { starred: true }),
		];

		expect(order(items)).toEqual(["starred", "watcher", "waiting", "plain"]);
	});

	it("keeps a starred watcher in the starred tier", () => {
		const items = [
			item("waiting", { waiting: true }),
			item("starredWatcher", { starred: true, watcher: true }),
		];

		expect(order(items)).toEqual(["starredWatcher", "waiting"]);
	});

	it("keeps a waiting watcher above a plain waiter", () => {
		const items = [
			item("waiting", { waiting: true }),
			item("waitingWatcher", { watcher: true, waiting: true }),
		];

		expect(order(items)).toEqual(["waitingWatcher", "waiting"]);
	});

	it("preserves the given order within a tier", () => {
		const items = [
			item("a", { watcher: true }),
			item("b", { watcher: true }),
			item("c"),
			item("d"),
		];

		expect(order(items)).toEqual(["a", "b", "c", "d"]);
	});

	it("treats nothing as a watcher when no predicate is given", () => {
		const items = [
			item("plain"),
			item("watcher", { watcher: true }),
			item("waiting", { waiting: true }),
		];

		const sorted = starredThenWaitingFirst(
			items,
			(i) => i.starred === true,
			(i) => i.waiting === true,
		);

		expect(sorted.map((i) => i.id)).toEqual(["waiting", "plain", "watcher"]);
	});
});
