export function isRustFile(filePath: string | undefined): boolean {
	return filePath?.endsWith(".rs") ?? false;
}
