import { apiUrl } from "../../../../../apiUrl";
import type { ResolveImageSrc } from "./imageTag";

const ATTACHMENT =
	/^https:\/\/github\.com\/user-attachments\/assets\/([0-9a-f-]{36})(?:[?#].*)?$/i;

export function descriptionImageSrc(
	repo: string,
	prNumber: number,
): ResolveImageSrc {
	return (src) => {
		const asset = ATTACHMENT.exec(src)?.[1];
		if (asset) {
			const params = new URLSearchParams({
				repo,
				pr: String(prNumber),
				asset,
			});
			return apiUrl(`/api/github-attachment?${params}`);
		}
		return /^https:\/\//i.test(src) ? src : null;
	};
}
