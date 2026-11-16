import { describe, expect, it } from "vitest";
import { signedAttachmentUrl } from "./signedAttachmentUrl";

const asset = "0b6f7c1e-2d3a-4b5c-8d9e-0123456789ab";

describe("signedAttachmentUrl", () => {
	it("returns the signed private-user-images URL carrying the asset id", () => {
		const signed = `https://private-user-images.githubusercontent.com/1/2-${asset}.png?jwt=a.b&amp;x=1`;
		const html = `<p><a href="${signed}"><img src="${signed}" alt="image"></a></p>`;

		expect(signedAttachmentUrl(html, asset)).toBe(
			`https://private-user-images.githubusercontent.com/1/2-${asset}.png?jwt=a.b&x=1`,
		);
	});

	it("returns the public attachment URL when that is what GitHub rendered", () => {
		const url = `https://github.com/user-attachments/assets/${asset}`;

		expect(signedAttachmentUrl(`<img src="${url}">`, asset)).toBe(url);
	});

	it("prefers the signed URL over an earlier unsigned link to the asset", () => {
		const signed = `https://private-user-images.githubusercontent.com/1/2-${asset}.png?jwt=a`;
		const html = `<a href="https://github.com/user-attachments/assets/${asset}">x</a><img src="${signed}">`;

		expect(signedAttachmentUrl(html, asset)).toBe(signed);
	});

	it("ignores URLs on other hosts and other assets", () => {
		const html = `<img src="https://evil.example/${asset}.png"><img src="https://private-user-images.githubusercontent.com/1/2-other.png">`;

		expect(signedAttachmentUrl(html, asset)).toBeNull();
	});
});
