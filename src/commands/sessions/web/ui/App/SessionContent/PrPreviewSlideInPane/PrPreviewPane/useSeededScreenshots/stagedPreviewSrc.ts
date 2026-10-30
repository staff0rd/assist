import { apiUrl } from "../../../../../apiUrl";

export function stagedPreviewSrc(path: string, node?: string): string {
	const params = new URLSearchParams({ path });
	if (node) params.set("node", node);
	return apiUrl(`/api/pr-preview/image?${params}`);
}
