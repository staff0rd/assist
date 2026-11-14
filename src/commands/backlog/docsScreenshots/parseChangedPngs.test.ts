import { describe, expect, it } from "vitest";
import { parseChangedPngs } from "./parseChangedPngs";

describe("parseChangedPngs", () => {
	it("keeps added, modified, untracked and renamed PNGs but not deleted ones", () => {
		const porcelain = [
			" M shots/panel.png",
			"A  shots/new.png",
			"?? shots/untracked.png",
			"R  shots/old.png -> shots/renamed.png",
			" D shots/gone.png",
			" M shots/notes.txt",
		].join("\n");

		expect([...parseChangedPngs(porcelain)].sort()).toEqual([
			"new.png",
			"panel.png",
			"renamed.png",
			"untracked.png",
		]);
	});
});
