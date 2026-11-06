import type { AscClient } from "./createAscClient";
import { nameFromEmail } from "./nameFromEmail";

export async function inviteTeamMember(
	client: AscClient,
	appId: string,
	email: string,
): Promise<void> {
	const { firstName, lastName } = nameFromEmail(email);
	await client.post("/v1/userInvitations", {
		data: {
			type: "userInvitations",
			attributes: {
				email,
				firstName,
				lastName,
				roles: ["DEVELOPER"],
				allAppsVisible: false,
				provisioningAllowed: false,
			},
			relationships: {
				visibleApps: { data: [{ type: "apps", id: appId }] },
			},
		},
	});
}
