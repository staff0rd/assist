import type { AscClient } from "./createAscClient";
import { type AscConnectOptions, connectAsc } from "./connectAsc";
import { findBetaGroupId } from "./findBetaGroupId";
import { listAppTeam } from "./listAppTeam";
import { listGroupTesters } from "./listGroupTesters";
import { mergeInternalPeople } from "./mergeInternalPeople";
import type { TestflightConfig } from "./readTestflightConfig";
import type { InternalPerson, TestflightTesters } from "./TestflightTesters";

async function listInternal(
	client: AscClient,
	appId: string,
	groupName: string | undefined,
): Promise<InternalPerson[]> {
	if (!groupName) return [];
	const groupId = await findBetaGroupId(client, appId, {
		name: groupName,
		configKey: "testflight.internalGroup",
		internal: true,
	});
	const [team, groupTesters] = await Promise.all([
		listAppTeam(client, appId),
		listGroupTesters(client, groupId),
	]);
	return mergeInternalPeople({ ...team, groupTesters });
}

export async function listTesters(
	config: TestflightConfig,
	options: AscConnectOptions = {},
): Promise<TestflightTesters> {
	const { client, appId } = await connectAsc(config, options);
	const externalGroupId = await findBetaGroupId(client, appId, {
		name: config.externalGroup,
		configKey: "testflight.externalGroup",
		internal: false,
	});
	const [internal, external] = await Promise.all([
		listInternal(client, appId, config.internalGroup),
		listGroupTesters(client, externalGroupId),
	]);
	return { bundleId: config.bundleId, internal, external };
}
