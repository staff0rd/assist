import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
	clearSignalOwner,
	readSignalOwner,
	recordSignalOwner,
} from "./recordSignalOwner";

const ITEM = 8123;

describe("signalOwner", () => {
	beforeEach(() => {
		delete process.env.ASSIST_SESSION_ID;
		clearSignalOwner(ITEM);
	});

	afterEach(() => {
		clearSignalOwner(ITEM);
		delete process.env.ASSIST_SESSION_ID;
	});

	it("records and reads back the owning session id", () => {
		process.env.ASSIST_SESSION_ID = "run-wrapper";
		recordSignalOwner(ITEM);
		expect(readSignalOwner(ITEM)).toBe("run-wrapper");
	});

	it("records nothing when no session is active", () => {
		recordSignalOwner(ITEM);
		expect(readSignalOwner(ITEM)).toBeUndefined();
	});

	it("returns undefined after the owner is cleared", () => {
		process.env.ASSIST_SESSION_ID = "run-wrapper";
		recordSignalOwner(ITEM);
		clearSignalOwner(ITEM);
		expect(readSignalOwner(ITEM)).toBeUndefined();
	});
});
