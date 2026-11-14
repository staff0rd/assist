import { type Location, NavigationType } from "react-router";

export type NavStackState = {
	stack: Location[];
	leaving?: Location;
	transition?: { id: number; kind: "push" | "pop" };
	gesture?: "tracking" | "done";
	seq: number;
};

const MAX_DEPTH = 50;

function hasFlag(location: Location, flag: "phoneTab" | "phoneBack") {
	const state = location.state as Record<string, unknown> | null;
	return state?.[flag] === true;
}

function settle(
	prev: NavStackState,
	stack: Location[],
	kind?: "push" | "pop",
	leaving?: Location,
): NavStackState {
	const seq = prev.seq + 1;
	const animate = kind && prev.gesture !== "done";
	return {
		stack: stack.slice(-MAX_DEPTH),
		leaving: animate ? leaving : undefined,
		transition: animate ? { id: seq, kind } : undefined,
		seq,
	};
}

export function nextNavStack(
	prev: NavStackState,
	location: Location,
	type: NavigationType,
): NavStackState {
	const { stack } = prev;
	const top = stack.at(-1);
	const below = stack.slice(0, -1);
	if (type === NavigationType.Push)
		return settle(
			prev,
			[...stack, location],
			top && !hasFlag(location, "phoneTab") ? "push" : undefined,
		);
	if (type === NavigationType.Replace)
		return hasFlag(location, "phoneBack")
			? settle(prev, [...below, location], "pop", top)
			: settle(prev, [...below, location]);
	const index = stack.findIndex(({ key }) => key === location.key);
	if (index === -1) return settle(prev, [location]);
	const popped = stack.slice(0, index + 1);
	return index === stack.length - 2
		? settle(prev, popped, "pop", top)
		: settle(prev, popped);
}
