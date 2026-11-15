import { delimiter } from "node:path";
import { describe, expect, it } from "vitest";
import { withHarnessPath } from "./withHarnessPath";

describe("withHarnessPath", () => {
	it("prepends the bin dir to an existing PATH under its own casing", () => {
		expect(
			withHarnessPath({ Path: String.raw`C:\bin` }, String.raw`C:\node`),
		).toEqual({
			Path: String.raw`C:\node${delimiter}C:\bin`,
		});
	});

	it("leaves the env alone when no node is declared", () => {
		const env = { PATH: "/usr/bin" };
		expect(withHarnessPath(env, undefined)).toBe(env);
	});
});
