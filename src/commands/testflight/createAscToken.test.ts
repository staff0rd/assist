import { generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import { createAscToken } from "./createAscToken";

const { privateKey, publicKey } = generateKeyPairSync("ec", {
	namedCurve: "prime256v1",
});
const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString();

function decode(part: string): Record<string, unknown> {
	return JSON.parse(Buffer.from(part, "base64url").toString());
}

describe("createAscToken", () => {
	const token = createAscToken({
		keyId: "KEY123",
		issuerId: "issuer-uuid",
		privateKey: pem,
		now: 1_700_000_000_000,
	});
	const [header, payload, signature] = token.split(".");

	it("sets the ES256 header with the key id", () => {
		expect(decode(header)).toEqual({ alg: "ES256", kid: "KEY123", typ: "JWT" });
	});

	it("sets issuer, audience and a 20-minute expiry", () => {
		expect(decode(payload)).toEqual({
			iss: "issuer-uuid",
			iat: 1_700_000_000,
			exp: 1_700_001_200,
			aud: "appstoreconnect-v1",
		});
	});

	it("signs with a raw 64-byte ES256 signature", () => {
		const raw = Buffer.from(signature, "base64url");
		expect(raw).toHaveLength(64);
		const valid = verify(
			"sha256",
			Buffer.from(`${header}.${payload}`),
			{ key: publicKey, dsaEncoding: "ieee-p1363" },
			raw,
		);
		expect(valid).toBe(true);
	});
});
