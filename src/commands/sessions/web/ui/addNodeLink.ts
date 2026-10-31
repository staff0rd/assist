export function addNodeLink(url: string, name: string): string {
	const params = new URLSearchParams({ url, name });
	return `assist://add-node?${params.toString()}`;
}
