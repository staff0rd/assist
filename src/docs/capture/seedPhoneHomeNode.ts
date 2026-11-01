import type { BrowserContext } from "playwright";
import { phoneCaptureFlag } from "../../commands/sessions/web/ui/phoneCaptureFlag";

const HOME_NODE_NAME = "mac";

export async function seedPhoneHomeNode(
	context: BrowserContext,
	baseUrl: string,
): Promise<void> {
	await context.addInitScript(
		({ flag, name, url }) => {
			localStorage.setItem(flag, "1");
			localStorage.setItem(
				"CapacitorStorage.savedNodes",
				JSON.stringify([{ name, url }]),
			);
			localStorage.setItem("CapacitorStorage.homeNodeUrl", url);
		},
		{ flag: phoneCaptureFlag, name: HOME_NODE_NAME, url: baseUrl },
	);
}
