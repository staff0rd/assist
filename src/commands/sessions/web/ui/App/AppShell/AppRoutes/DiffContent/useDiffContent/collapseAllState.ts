export function collapseAllState(
	visiblePaths: string[],
	collapsedFiles: {
		isCollapsed: (path: string) => boolean;
		setAll: (paths: string[], collapsed: boolean) => void;
	},
): { allCollapsed: boolean; onToggleCollapseAll: () => void } {
	const allCollapsed =
		visiblePaths.length > 0 &&
		visiblePaths.every((path) => collapsedFiles.isCollapsed(path));

	return {
		allCollapsed,
		onToggleCollapseAll: () =>
			collapsedFiles.setAll(visiblePaths, !allCollapsed),
	};
}
