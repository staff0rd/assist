export function baseName(path: string): string {
	return path.split(/[\\/]/).pop() || path;
}
