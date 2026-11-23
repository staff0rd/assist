import { describe, expect, it } from "vitest";
import { makeSession } from "../../../test/mothers/makeSession";
import { inheritYolo } from "./inheritYolo";

function spawn(parentYolo: boolean) {
	const parent = makeSession({ id: "6", ...(parentYolo && { yolo: true }) });
	const d: Record<string, unknown> = { type: "create-assist", yoloFrom: "6" };
	inheritYolo(d, (id) => (id === "6" ? parent : undefined));
	return d;
}

describe("inheritYolo", () => {
	it("sets yolo on a session launched from a yolo run session", () => {
		expect(spawn(true)).toEqual({ type: "create-assist", yolo: true });
	});

	it("leaves yolo off for a session launched from a non-yolo run", () => {
		expect(spawn(false)).toEqual({ type: "create-assist" });
	});
});
