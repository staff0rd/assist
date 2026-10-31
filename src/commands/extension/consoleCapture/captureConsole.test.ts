// @vitest-environment jsdom
import {
	afterAll,
	beforeAll,
	beforeEach,
	describe,
	expect,
	it,
	vi,
} from "vitest";
import { captureConsole } from "./captureConsole";
import { CONSOLE_EVENT } from "./types";

const original = { ...console };
let captured: Record<string, unknown>[] = [];

beforeAll(() => {
	for (const level of ["log", "info", "debug", "warn", "error"] as const)
		console[level] = vi.fn();
	document.addEventListener(CONSOLE_EVENT, (event) =>
		captured.push(JSON.parse((event as CustomEvent).detail as string)),
	);
	captureConsole();
});

beforeEach(() => {
	captured = [];
});

afterAll(() => {
	Object.assign(console, original);
});

describe("captureConsole", () => {
	it("captures warn and error with their arguments and still logs them", () => {
		const error = new Error("bad");
		console.warn("count", 2, { a: 1 });
		console.error(error);
		expect(captured).toMatchObject([
			{ level: "warn", message: 'count 2 {"a":1}', url: location.href },
			{ level: "error", message: "Error: bad", stack: error.stack },
		]);
	});

	it("never captures log, info or debug", () => {
		console.log("a");
		console.info("b");
		console.debug("c");
		expect(captured).toEqual([]);
	});

	it("captures unhandled rejections with their stack", () => {
		const reason = new Error("rejected");
		const event = new Event("unhandledrejection");
		Object.assign(event, { reason });
		globalThis.dispatchEvent(event);
		expect(captured).toMatchObject([
			{ level: "rejection", message: "Error: rejected", stack: reason.stack },
		]);
	});

	it("captures uncaught errors with their stack", () => {
		const error = new Error("uncaught");
		globalThis.dispatchEvent(
			new ErrorEvent("error", { message: "Uncaught Error: uncaught", error }),
		);
		expect(captured).toMatchObject([
			{
				level: "uncaught",
				message: "Uncaught Error: uncaught",
				stack: error.stack,
			},
		]);
	});
});
