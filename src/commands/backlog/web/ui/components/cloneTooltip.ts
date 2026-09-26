export function cloneTooltip(
	node: string | undefined,
	cloneTarget: string,
): string {
	return `Not cloned ${node ? `on ${node}` : "locally"} — click to clone into ${cloneTarget}`;
}
