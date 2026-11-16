import { describe, expect, it, vi } from "vitest";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";

vi.mock("./acquireLock", () => ({ isLockedByOther: vi.fn(() => false) }));

import { findResumable } from "./findResumable";

const plan = [{ name: "p", tasks: [] }];

describe("findResumable", () => {
	it("resumes an in-progress item with a plan", () => {
		const item = makeBacklogItem({ status: "in-progress", plan });
		expect(findResumable([item])).toBe(item);
	});

	it("skips an item whose run is parked on parallel phases", () => {
		const parked = makeBacklogItem({
			id: 1,
			status: "in-progress",
			plan,
			runningPhases: [2, 3],
		});
		const other = makeBacklogItem({ id: 2, status: "in-progress", plan });
		expect(findResumable([parked, other])).toBe(other);
	});
});
