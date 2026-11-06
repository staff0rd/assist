import type { AscClient } from "./createAscClient";
import { TestflightError } from "./TestflightError";

type GroupLookup = { name: string; configKey: string; internal: boolean };

export async function findBetaGroupId(
	client: AscClient,
	appId: string,
	lookup: GroupLookup,
): Promise<string> {
	const { data } = await client.get(`/v1/apps/${appId}/betaGroups`, {
		"fields[betaGroups]": "name,isInternalGroup",
		limit: "200",
	});
	const group = data.find((item) => item.attributes?.name === lookup.name);
	if (!group) {
		const available = data
			.map((item) => String(item.attributes?.name))
			.join(", ");
		throw new TestflightError(
			`No beta group named "${lookup.name}" (${lookup.configKey}). Available groups: ${available || "none"}`,
		);
	}
	if (Boolean(group.attributes?.isInternalGroup) !== lookup.internal) {
		const kind = lookup.internal ? "an internal" : "an external";
		throw new TestflightError(
			`Beta group "${lookup.name}" (${lookup.configKey}) must be ${kind} group`,
		);
	}
	return group.id;
}
