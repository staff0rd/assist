import { describe, expect, it } from "vitest";
import { owningPhoneTab } from "./owningPhoneTab";

describe("owningPhoneTab", () => {
	it.each([
		["/", "/"],
		["/session/abc", "/"],
		["/history", "/history"],
		["/history/abc", "/history"],
		["/backlog", "/backlog"],
		["/backlog/12/criteria", "/backlog"],
		["/backlogs", "/"],
	])("assigns %s to %s", (pathname, tab) => {
		expect(owningPhoneTab(pathname)).toBe(tab);
	});
});
