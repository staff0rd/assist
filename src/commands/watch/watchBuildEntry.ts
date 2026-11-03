const DEFAULT_BUILD_ENTRY = "auto-build";

export function watchBuildEntry(build: true | string): string {
	return typeof build === "string" ? build : DEFAULT_BUILD_ENTRY;
}
