import type { AscClient } from "./createAscClient";
import { TestflightError } from "./TestflightError";

export async function findBetaGroupId(
	client: AscClient,
	appId: string,
	name: string,
	configKey: string,
): Promise<string> {
	const { data } = await client.get(`/v1/apps/${appId}/betaGroups`, {
		"fields[betaGroups]": "name",
		limit: "200",
	});
	const group = data.find((item) => item.attributes?.name === name);
	if (!group) {
		const available = data
			.map((item) => String(item.attributes?.name))
			.join(", ");
		throw new TestflightError(
			`No beta group named "${name}" (${configKey}). Available groups: ${available || "none"}`,
		);
	}
	return group.id;
}
