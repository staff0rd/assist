const UI_EXTENSIONS = [
	".tsx",
	".jsx",
	".css",
	".html",
	".swift",
	".vue",
	".svelte",
];

const TEST_FILE = /\.(test|spec)\.[^/]+$/;

export function isUiFile(path: string): boolean {
	const lower = path.toLowerCase();
	return (
		UI_EXTENSIONS.some((ext) => lower.endsWith(ext)) && !TEST_FILE.test(lower)
	);
}
