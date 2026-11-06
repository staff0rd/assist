import type { AscClient, AscResource } from "./createAscClient";

function seesApp(item: AscResource, appId: string): boolean {
	if (item.attributes?.allAppsVisible) return true;
	const linked = item.relationships?.visibleApps?.data;
	return Array.isArray(linked) && linked.some((app) => app.id === appId);
}

async function listEmails(
	client: AscClient,
	path: string,
	type: string,
	emailAttribute: string,
	appId: string,
): Promise<string[]> {
	const { data } = await client.get(path, {
		include: "visibleApps",
		[`fields[${type}]`]: `${emailAttribute},allAppsVisible,visibleApps`,
		"fields[apps]": "bundleId",
		limit: "200",
	});
	return data
		.filter((item) => seesApp(item, appId))
		.map((item) => String(item.attributes?.[emailAttribute]));
}

export async function listAppTeam(
	client: AscClient,
	appId: string,
): Promise<{ members: string[]; invitees: string[] }> {
	const [members, invitees] = await Promise.all([
		listEmails(client, "/v1/users", "users", "username", appId),
		listEmails(
			client,
			"/v1/userInvitations",
			"userInvitations",
			"email",
			appId,
		),
	]);
	return { members, invitees };
}
