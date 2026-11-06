import type { AscClient } from "./createAscClient";

export type AddTesterResult = "created" | "added" | "already-in-group";

export async function addExternalTester(
	client: AscClient,
	groupId: string,
	email: string,
): Promise<AddTesterResult> {
	const inGroup = await client.get("/v1/betaTesters", {
		"filter[email]": email,
		"filter[betaGroups]": groupId,
		limit: "1",
	});
	if (inGroup.data.length > 0) return "already-in-group";

	const existing = await client.get("/v1/betaTesters", {
		"filter[email]": email,
		limit: "1",
	});
	const tester = existing.data[0];
	if (tester) {
		await client.post(`/v1/betaGroups/${groupId}/relationships/betaTesters`, {
			data: [{ type: "betaTesters", id: tester.id }],
		});
		return "added";
	}

	await client.post("/v1/betaTesters", {
		data: {
			type: "betaTesters",
			attributes: { email },
			relationships: {
				betaGroups: { data: [{ type: "betaGroups", id: groupId }] },
			},
		},
	});
	return "created";
}
