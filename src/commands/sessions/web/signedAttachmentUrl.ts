const ASSET_ID = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;
const SIGNED_HOST = "private-user-images.githubusercontent.com";

export function isAttachmentAssetId(assetId: string): boolean {
	return ASSET_ID.test(assetId);
}

// GitHub renders a private attachment as a short-lived signed
// private-user-images URL whose file name carries the asset id.
export function signedAttachmentUrl(
	bodyHtml: string,
	assetId: string,
): string | null {
	let unsigned: string | null = null;
	for (const [, raw] of bodyHtml.matchAll(/\b(?:src|href)="(https:[^"]+)"/g)) {
		const url = (raw as string).replace(/&amp;/g, "&");
		if (!url.toLowerCase().includes(assetId.toLowerCase())) continue;
		const { hostname } = new URL(url);
		if (hostname === SIGNED_HOST) return url;
		if (hostname === "github.com") unsigned ??= url;
	}
	return unsigned;
}
