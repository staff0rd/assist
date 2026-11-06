import { type AddTesterResult, addToBetaGroup } from "./addToBetaGroup";
import type { AscClient } from "./createAscClient";
import { inviteTeamMember } from "./inviteTeamMember";

export type InternalTesterResult =
	| AddTesterResult
	| "invited"
	| "invite-pending";

type InternalTarget = { appId: string; groupId: string };

async function hasMatch(
	client: AscClient,
	path: string,
	params: Record<string, string>,
	attribute: string,
	email: string,
): Promise<boolean> {
	const { data } = await client.get(path, params);
	return data.some(
		(item) =>
			String(item.attributes?.[attribute]).toLowerCase() ===
			email.toLowerCase(),
	);
}

export async function addInternalTester(
	client: AscClient,
	target: InternalTarget,
	email: string,
): Promise<InternalTesterResult> {
	const isMember = await hasMatch(
		client,
		"/v1/users",
		{ "filter[username]": email, "fields[users]": "username" },
		"username",
		email,
	);
	if (isMember) return addToBetaGroup(client, target.groupId, email);

	const isInvited = await hasMatch(
		client,
		"/v1/userInvitations",
		{ "filter[email]": email, "fields[userInvitations]": "email" },
		"email",
		email,
	);
	if (isInvited) return "invite-pending";

	await inviteTeamMember(client, target.appId, email);
	return "invited";
}
