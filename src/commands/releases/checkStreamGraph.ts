function nodeIds(stream: Record<string, unknown>): string[] {
	const nodes = Array.isArray(stream.nodes) ? stream.nodes : [];
	return nodes.flatMap((node) =>
		node !== null && typeof node === "object" && typeof node.id === "string"
			? [node.id]
			: [],
	);
}

function repeatedIds(ids: string[]): string[] {
	const seen = new Set<string>();
	const repeated = new Set<string>();
	for (const id of ids) {
		if (seen.has(id)) repeated.add(id);
		seen.add(id);
	}
	return [...repeated];
}

function unknownEdgeIds(
	stream: Record<string, unknown>,
	known: Set<string>,
): string[] {
	const edges = Array.isArray(stream.edges) ? stream.edges : [];
	return edges.flatMap((edge) =>
		(Array.isArray(edge) ? edge : []).filter(
			(id) => typeof id === "string" && !known.has(id),
		),
	);
}

export function checkStreamGraph(streams: Record<string, unknown>[]): string[] {
	return streams.flatMap((stream, index) => {
		const where =
			typeof stream.name === "string" ? stream.name : `stream ${index}`;
		const ids = nodeIds(stream);
		return [
			...repeatedIds(ids).map((id) => `${where}: duplicate node id "${id}"`),
			...unknownEdgeIds(stream, new Set(ids)).map(
				(id) => `${where}: edge refers to unknown node "${id}"`,
			),
		];
	});
}
