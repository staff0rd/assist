import { createPrivateKey, sign } from "node:crypto";

type AscTokenOptions = {
	keyId: string;
	issuerId: string;
	privateKey: string;
	now?: number;
};

const TOKEN_LIFETIME_SECONDS = 20 * 60;

function base64url(value: object): string {
	return Buffer.from(JSON.stringify(value)).toString("base64url");
}

export function createAscToken(options: AscTokenOptions): string {
	const iat = Math.floor((options.now ?? Date.now()) / 1000);
	const header = { alg: "ES256", kid: options.keyId, typ: "JWT" };
	const payload = {
		iss: options.issuerId,
		iat,
		exp: iat + TOKEN_LIFETIME_SECONDS,
		aud: "appstoreconnect-v1",
	};
	const signingInput = `${base64url(header)}.${base64url(payload)}`;
	const signature = sign("sha256", Buffer.from(signingInput), {
		key: createPrivateKey(options.privateKey),
		dsaEncoding: "ieee-p1363",
	});
	return `${signingInput}.${signature.toString("base64url")}`;
}
