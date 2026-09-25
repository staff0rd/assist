import { type RefObject, useLayoutEffect, useState } from "react";
import {
	measureReleaseEdges,
	type ReleaseEdgeGeometry,
	sameReleaseEdges,
} from "./measureReleaseEdges";

const EMPTY: ReleaseEdgeGeometry = { width: 0, height: 0, paths: [] };

export function useReleaseEdgePaths(
	graphRef: RefObject<HTMLElement | null>,
	edges: [string, string][],
): ReleaseEdgeGeometry {
	const [geometry, setGeometry] = useState<ReleaseEdgeGeometry>(EMPTY);

	useLayoutEffect(() => {
		const graph = graphRef.current;
		if (!graph) return;
		let frame = 0;
		const update = () => {
			const next = measureReleaseEdges(graph, edges);
			setGeometry((previous) =>
				sameReleaseEdges(previous, next) ? previous : next,
			);
		};
		const schedule = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(update);
		};
		update();
		const observer = new ResizeObserver(schedule);
		observer.observe(graph);
		for (const node of graph.querySelectorAll("[data-release-node]"))
			observer.observe(node);
		window.addEventListener("resize", schedule);
		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			window.removeEventListener("resize", schedule);
		};
	}, [graphRef, edges]);

	return geometry;
}
