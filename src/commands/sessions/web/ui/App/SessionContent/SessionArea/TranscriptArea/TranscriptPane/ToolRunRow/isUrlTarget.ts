export function isUrlTarget(target: string): boolean {
	return /^https?:\/\/\S+$/.test(target.trim());
}
