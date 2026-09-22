export type ReleaseEdgeGeometry = {
	width: number;
	height: number;
	paths: string[];
};

type Anchor = { left: number; right: number; y: number };

function anchor(graph: HTMLElement, base: DOMRect, id: string): Anchor | null {
	const element = graph.querySelector(
		`[data-release-node="${CSS.escape(id)}"]`,
	);
	if (!element) return null;
	const box = element.getBoundingClientRect();
	return {
		left: box.left - base.left,
		right: box.right - base.left,
		y: box.top - base.top + box.height / 2,
	};
}

export function measureReleaseEdges(
	graph: HTMLElement,
	edges: [string, string][],
): ReleaseEdgeGeometry {
	const base = graph.getBoundingClientRect();
	const paths = edges.map(([from, to]) => {
		const a = anchor(graph, base, from);
		const b = anchor(graph, base, to);
		if (!a || !b) return "";
		const mid = (a.right + b.left) / 2;
		return `M ${a.right} ${a.y} C ${mid} ${a.y}, ${mid} ${b.y}, ${b.left} ${b.y}`;
	});
	return { width: base.width, height: base.height, paths };
}

export function sameReleaseEdges(
	a: ReleaseEdgeGeometry,
	b: ReleaseEdgeGeometry,
): boolean {
	return (
		a.width === b.width &&
		a.height === b.height &&
		a.paths.length === b.paths.length &&
		a.paths.every((path, index) => path === b.paths[index])
	);
}
