import { describe, expect, it } from "vitest";
import { autostartFields } from "./autostartFields";

describe("autostartFields", () => {
	it("carries the picked node and its clone on Approve & start", () => {
		expect(
			autostartFields(true, { node: "win", cwd: "C:\\git\\repo" }),
		).toEqual({
			autostart: true,
			startOn: { node: "win", cwd: "C:\\git\\repo" },
		});
	});

	it("sends no node when none was picked", () => {
		expect(autostartFields(true, true)).toEqual({ autostart: true });
	});

	it("sends nothing on a plain approve or a reject", () => {
		expect(autostartFields(true, false)).toEqual({});
		expect(autostartFields(false, { node: "win", cwd: "/r" })).toEqual({});
	});
});
