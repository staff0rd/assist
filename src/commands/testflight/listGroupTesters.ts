import type { AscClient } from "./createAscClient";
import type { ExternalTester } from "./TestflightTesters";
import { toTesterState } from "./toTesterState";

export async function listGroupTesters(
	client: AscClient,
	groupId: string,
): Promise<ExternalTester[]> {
	const { data } = await client.get("/v1/betaTesters", {
		"filter[betaGroups]": groupId,
		"fields[betaTesters]": "email,state",
		limit: "200",
	});
	return data
		.map((item) => ({
			email: String(item.attributes?.email),
			testflight: toTesterState(item.attributes?.state),
		}))
		.sort((a, b) => a.email.localeCompare(b.email));
}
