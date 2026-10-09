// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import {
	loadPersistedScreenshots,
	savePersistedScreenshots,
} from "../loadPersistedScreenshots";
import { seedScreenshots } from "./seedScreenshots";

const light = { path: "/staged/u1/light.png", alt: "light", group: "Profile" };
const dark = { path: "/staged/u2/dark.mp4", alt: "dark", group: "Profile" };

beforeEach(() => localStorage.clear());

describe("seedScreenshots", () => {
	it("seeds the request's screenshots with their content types", () => {
		expect(seedScreenshots("s:pr", "r1", [light, dark])).toEqual([
			{ ...light, contentType: "image/png", seeded: true },
			{ ...dark, contentType: "video/mp4", seeded: true },
		]);
	});

	it("keeps the reviewer's removals on reload of the same request", () => {
		const [first] = seedScreenshots("s:pr", "r1", [light, dark]);
		savePersistedScreenshots("s:pr", [first]);

		expect(seedScreenshots("s:pr", "r1", [light, dark])).toEqual([first]);
	});

	it("replaces the previous request's seeds but keeps dropped images", () => {
		seedScreenshots("s:pr", "r1", [light]);
		const dropped = {
			path: "/staged/u3/drop.png",
			alt: "drop",
			contentType: "image/png",
		};
		savePersistedScreenshots("s:pr", [
			...loadPersistedScreenshots("s:pr"),
			dropped,
		]);

		expect(seedScreenshots("s:pr", "r2", [dark])).toEqual([
			{ ...dark, contentType: "video/mp4", seeded: true },
			dropped,
		]);
	});

	it("seeds without persisting when there is no scope", () => {
		expect(seedScreenshots(undefined, "r1", [light])).toHaveLength(1);
		expect(localStorage.length).toBe(0);
	});
});
