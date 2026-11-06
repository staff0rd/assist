import { resolveOpSecret } from "../ravendb/resolveOpSecret";
import {
	type InternalTesterResult,
	addInternalTester,
} from "./addInternalTester";
import { addToBetaGroup } from "./addToBetaGroup";
import { createAscClient } from "./createAscClient";
import { createAscToken } from "./createAscToken";
import { findAppId } from "./findAppId";
import { findBetaGroupId } from "./findBetaGroupId";
import type { TestflightConfig } from "./readTestflightConfig";
import { requireInternalGroup } from "./requireInternalGroup";

type AddTesterOptions = {
	internal?: boolean;
	readKey?: (reference: string) => string;
	fetchFn?: typeof fetch;
};

export async function addTester(
	config: TestflightConfig,
	email: string,
	options: AddTesterOptions = {},
): Promise<InternalTesterResult> {
	const internalGroup = options.internal
		? requireInternalGroup(config)
		: undefined;
	const privateKey = (options.readKey ?? resolveOpSecret)(config.keyRef);
	const token = createAscToken({
		keyId: config.keyId,
		issuerId: config.issuerId,
		privateKey,
	});
	const client = createAscClient(token, options.fetchFn);
	const appId = await findAppId(client, config.bundleId);
	const groupId = await findBetaGroupId(client, appId, {
		name: internalGroup ?? config.externalGroup,
		configKey: internalGroup
			? "testflight.internalGroup"
			: "testflight.externalGroup",
		internal: Boolean(internalGroup),
	});
	return internalGroup
		? addInternalTester(client, { appId, groupId }, email)
		: addToBetaGroup(client, groupId, email);
}
