import { type AscClient, createAscClient } from "./createAscClient";
import { createAscToken } from "./createAscToken";
import { findAppId } from "./findAppId";
import { readAscKey } from "./readAscKey";
import type { TestflightConfig } from "./readTestflightConfig";

export type AscConnectOptions = {
	readKey?: (reference: string) => string | Promise<string>;
	fetchFn?: typeof fetch;
};

export async function connectAsc(
	config: TestflightConfig,
	options: AscConnectOptions = {},
): Promise<{ client: AscClient; appId: string }> {
	const privateKey = await (options.readKey ?? readAscKey)(config.keyRef);
	const token = createAscToken({
		keyId: config.keyId,
		issuerId: config.issuerId,
		privateKey,
	});
	const client = createAscClient(token, options.fetchFn);
	return { client, appId: await findAppId(client, config.bundleId) };
}
