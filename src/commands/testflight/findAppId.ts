import type { AscClient } from "./createAscClient";
import { TestflightError } from "./TestflightError";

export async function findAppId(
	client: AscClient,
	bundleId: string,
): Promise<string> {
	const { data } = await client.get("/v1/apps", {
		"filter[bundleId]": bundleId,
		"fields[apps]": "bundleId",
	});
	const app = data.find((item) => item.attributes?.bundleId === bundleId);
	if (!app) {
		throw new TestflightError(
			`No App Store Connect app has bundle id ${bundleId} (testflight.bundleId)`,
		);
	}
	return app.id;
}
