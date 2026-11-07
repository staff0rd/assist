import {
	type InternalTesterResult,
	addInternalTester,
} from "./addInternalTester";
import { addToBetaGroup } from "./addToBetaGroup";
import { type AscConnectOptions, connectAsc } from "./connectAsc";
import { findBetaGroupId } from "./findBetaGroupId";
import type { TestflightConfig } from "./readTestflightConfig";
import { requireInternalGroup } from "./requireInternalGroup";

export type AddTesterOptions = AscConnectOptions & { internal?: boolean };

export async function addTester(
	config: TestflightConfig,
	email: string,
	options: AddTesterOptions = {},
): Promise<InternalTesterResult> {
	const internalGroup = options.internal
		? requireInternalGroup(config)
		: undefined;
	const { client, appId } = await connectAsc(config, options);
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
