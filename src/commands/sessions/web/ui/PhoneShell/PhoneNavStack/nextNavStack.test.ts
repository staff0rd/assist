import { type Location, NavigationType } from "react-router";
import { describe, expect, it } from "vitest";
import { type NavStackState, nextNavStack } from "./nextNavStack";

function loc(key: string, state: unknown = null): Location {
	return { pathname: `/${key}`, search: "", hash: "", state, key };
}

const start = (...keys: string[]): NavStackState => ({
	stack: keys.map((k) => loc(k)),
	seq: 0,
});
const keys = (s: NavStackState) => s.stack.map((l) => l.key);

describe("nextNavStack", () => {
	it("animates a push over the current page", () => {
		const next = nextNavStack(start("a"), loc("b"), NavigationType.Push);
		expect(keys(next)).toEqual(["a", "b"]);
		expect(next.transition?.kind).toBe("push");
	});

	it("pushes tab switches without animating", () => {
		const next = nextNavStack(
			start("a"),
			loc("b", { phoneTab: true }),
			NavigationType.Push,
		);
		expect(keys(next)).toEqual(["a", "b"]);
		expect(next.transition).toBeUndefined();
	});

	it("animates a pop to the page beneath and keeps the old top leaving", () => {
		const prev = start("a", "b", "c");
		const next = nextNavStack(prev, prev.stack[1], NavigationType.Pop);
		expect(keys(next)).toEqual(["a", "b"]);
		expect(next.transition?.kind).toBe("pop");
		expect(next.leaving?.key).toBe("c");
	});

	it("jumps without animating on a deeper pop", () => {
		const prev = start("a", "b", "c");
		const next = nextNavStack(prev, prev.stack[0], NavigationType.Pop);
		expect(keys(next)).toEqual(["a"]);
		expect(next.transition).toBeUndefined();
	});

	it("resets on a pop to an unknown entry", () => {
		const next = nextNavStack(start("a", "b"), loc("z"), NavigationType.Pop);
		expect(keys(next)).toEqual(["z"]);
		expect(next.transition).toBeUndefined();
	});

	it("animates a back replace as a pop", () => {
		const next = nextNavStack(
			start("a"),
			loc("root", { phoneBack: true }),
			NavigationType.Replace,
		);
		expect(keys(next)).toEqual(["root"]);
		expect(next.transition?.kind).toBe("pop");
		expect(next.leaving?.key).toBe("a");
	});

	it("swaps the top instantly on a plain replace", () => {
		const next = nextNavStack(
			start("a", "b"),
			loc("c"),
			NavigationType.Replace,
		);
		expect(keys(next)).toEqual(["a", "c"]);
		expect(next.transition).toBeUndefined();
	});
});
