const MARKERS: [opener: string, label: string][] = [
	["/*", "/* */"],
	["@*", "@* *@"],
	["<!--", "<!-- -->"],
	["//", "//"],
	["#", "#"],
];

export function commentMarker(comment: string, fallback: string): string {
	return (
		MARKERS.find(([opener]) => comment.startsWith(opener))?.[1] ?? fallback
	);
}
