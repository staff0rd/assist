import { describe, expect, it } from "vitest";
import { autostartFields } from "./autostartFields";

describe("autostartFields", () => {
	it("carries the picked node and its clone on Approve + start", () => {
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

	it("flags a yolo start on Approve + start + yolo", () => {
		expect(autostartFields(true, { node: "win", cwd: "/r" }, true)).toEqual({
			autostart: true,
			startOn: { node: "win", cwd: "/r" },
			startYolo: true,
		});
		expect(autostartFields(true, true, true)).toEqual({
			autostart: true,
			startYolo: true,
		});
	});

	it("sends nothing on a plain approve or a reject", () => {
		expect(autostartFields(true, false)).toEqual({});
		expect(autostartFields(false, { node: "win", cwd: "/r" })).toEqual({});
		expect(autostartFields(false, true, true)).toEqual({});
	});
});
