import { describe, expect, it } from "vitest";
import { makeSessionInfo } from "../../../../../test/mothers/makeSessionInfo";
import { isSessionStarting } from "./isSessionStarting";

describe("isSessionStarting", () => {
	it("treats a live terminal session as starting until its first output", () => {
		const session = makeSessionInfo({ status: "running" });
		expect(isSessionStarting(session, new Set())).toBe(true);
		expect(isSessionStarting(session, new Set([session.id]))).toBe(false);
	});

	it("never treats an SDK session as starting, since it has no terminal output", () => {
		const session = makeSessionInfo({ status: "waiting", sdk: true });
		expect(isSessionStarting(session, new Set())).toBe(false);
	});
});
