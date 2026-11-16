const ASSET_ID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const RENDERED_HOSTS = new Set([
	"private-user-images.githubusercontent.com",
	"github.com",
]);

export function isAttachmentAssetId(assetId: string): boolean {
	return ASSET_ID.test(assetId);
}

// GitHub renders a private attachment as a short-lived signed
// private-user-images URL whose file name carries the asset id.
export function signedAttachmentUrl(
	bodyHtml: string,
	assetId: string,
): string | null {
	for (const [, raw] of bodyHtml.matchAll(/\b(?:src|href)="(https:[^"]+)"/g)) {
		const url = (raw as string).replace(/&amp;/g, "&");
		if (!url.toLowerCase().includes(assetId.toLowerCase())) continue;
		if (RENDERED_HOSTS.has(new URL(url).hostname)) return url;
	}
	return null;
}
