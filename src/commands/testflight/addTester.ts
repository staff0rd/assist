import { resolveOpSecret } from "../ravendb/resolveOpSecret";
import { type AddTesterResult, addExternalTester } from "./addExternalTester";
import { createAscClient } from "./createAscClient";
import { createAscToken } from "./createAscToken";
import { findAppId } from "./findAppId";
import { findBetaGroupId } from "./findBetaGroupId";
import type { TestflightConfig } from "./readTestflightConfig";

type AddTesterDeps = {
	readKey?: (reference: string) => string;
	fetchFn?: typeof fetch;
};

export async function addTester(
	config: TestflightConfig,
	email: string,
	deps: AddTesterDeps = {},
): Promise<AddTesterResult> {
	const privateKey = (deps.readKey ?? resolveOpSecret)(config.keyRef);
	const token = createAscToken({
		keyId: config.keyId,
		issuerId: config.issuerId,
		privateKey,
	});
	const client = createAscClient(token, deps.fetchFn);
	const appId = await findAppId(client, config.bundleId);
	const groupId = await findBetaGroupId(client, appId, {
		name: config.externalGroup,
		configKey: "testflight.externalGroup",
		internal: false,
	});
	return addExternalTester(client, groupId, email);
}
