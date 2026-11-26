import { describe, expect, it } from "vitest";
import {
	browserContextOptions,
	browserLaunchOptions,
} from "./browserLaunchOptions";

describe("browserLaunchOptions", () => {
	it("launches headed with a slow-mo when headed", () => {
		expect(browserLaunchOptions(true)).toEqual({
			headless: false,
			slowMo: 250,
		});
	});

	it("launches headless without a slow-mo by default", () => {
		expect(browserLaunchOptions(false)).toEqual({ headless: true });
	});
});

describe("browserContextOptions", () => {
	it("records video into the report directory when headless", () => {
		expect(browserContextOptions(false, "/r")).toEqual({
			viewport: { width: 1280, height: 800 },
			recordVideo: { dir: "/r", size: { width: 1280, height: 800 } },
		});
	});

	it("does not record video when headed", () => {
		expect(browserContextOptions(true, "/r")).toEqual({
			viewport: { width: 1280, height: 800 },
		});
	});
});
