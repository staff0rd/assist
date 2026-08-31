import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { slackWorkingFile } from "./slackWorkingFile";

const original = process.env.ASSIST_STORE_DIR;

beforeEach(() => {
	process.env.ASSIST_STORE_DIR = "/store";
});

afterEach(() => {
	process.env.ASSIST_STORE_DIR = original;
});

describe("slackWorkingFile", () => {
	it("puts the body under the store's slack directory", () => {
		expect(slackWorkingFile("#general")).toEqual({
			dir: join("/store", "slack"),
			bodyPath: join("/store", "slack", "general.md"),
		});
	});

	it("drops a leading @ from a direct message target", () => {
		expect(slackWorkingFile("@stafford").bodyPath).toBe(
			join("/store", "slack", "stafford.md"),
		);
	});

	it("lowercases and collapses anything that is not filename-safe", () => {
		expect(slackWorkingFile("#Team Alpha/Beta!").bodyPath).toBe(
			join("/store", "slack", "team-alpha-beta.md"),
		);
	});

	it("keeps a channel id as it is", () => {
		expect(slackWorkingFile("C012AB3CD").bodyPath).toBe(
			join("/store", "slack", "c012ab3cd.md"),
		);
	});

	it("falls back to a fixed name when nothing survives slugging", () => {
		expect(slackWorkingFile("#!!!").bodyPath).toBe(
			join("/store", "slack", "channel.md"),
		);
	});
});
