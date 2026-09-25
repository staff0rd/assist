type Frame = { node: string; next: number };

type TarjanState = {
	index: Map<string, number>;
	low: Map<string, number>;
	stack: string[];
	onStack: Set<string>;
	components: string[][];
};

function push(state: TarjanState, frames: Frame[], node: string): void {
	const i = state.index.size;
	state.index.set(node, i);
	state.low.set(node, i);
	state.stack.push(node);
	state.onStack.add(node);
	frames.push({ node, next: 0 });
}

function popComponent(state: TarjanState, node: string): void {
	const component: string[] = [];
	let member: string | undefined;
	do {
		member = state.stack.pop() as string;
		state.onStack.delete(member);
		component.push(member);
	} while (member !== node);
	state.components.push(component.sort());
}

function lowerTo(state: TarjanState, node: string, value: number): void {
	state.low.set(node, Math.min(state.low.get(node) as number, value));
}

function finish(state: TarjanState, frames: Frame[], node: string): void {
	frames.pop();
	const parent = frames.at(-1);
	if (parent) lowerTo(state, parent.node, state.low.get(node) as number);
	if (state.low.get(node) === state.index.get(node)) popComponent(state, node);
}

function step(
	state: TarjanState,
	frames: Frame[],
	successors: (node: string) => string[],
): void {
	const frame = frames.at(-1) as Frame;
	const next = successors(frame.node)[frame.next++];
	if (next === undefined) finish(state, frames, frame.node);
	else if (!state.index.has(next)) push(state, frames, next);
	else if (state.onStack.has(next))
		lowerTo(state, frame.node, state.index.get(next) as number);
}

/** Tarjan's algorithm; components come out with every successor's component before its own. */
export function findStronglyConnectedComponents(
	nodes: string[],
	successors: (node: string) => string[],
): string[][] {
	const state: TarjanState = {
		index: new Map(),
		low: new Map(),
		stack: [],
		onStack: new Set(),
		components: [],
	};
	for (const start of nodes) {
		if (state.index.has(start)) continue;
		const frames: Frame[] = [];
		push(state, frames, start);
		while (frames.length > 0) step(state, frames, successors);
	}
	return state.components;
}
