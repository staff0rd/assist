const BICEP_EXTENSIONS = [".bicep", ".bicepparam"];

export function isBicepFile(filePath: string | undefined): boolean {
	if (!filePath) return false;
	return BICEP_EXTENSIONS.some((ext) => filePath.endsWith(ext));
}
