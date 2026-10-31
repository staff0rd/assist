import { extensionUpdateStatus } from "../extension/extensionUpdateStatus";
import { fetchLatestSignedExtension } from "../extension/fetchLatestSignedExtension";
import { formatExtensionUpdate } from "./formatExtensionUpdate";
import { requestTab } from "./requestTab";

export async function browserStatus(options: {
	url?: string;
	server: string;
}): Promise<void> {
	const latest = fetchLatestSignedExtension()
		.then((signed) => signed.latest)
		.catch(() => undefined);
	const result = await requestTab(options.server, {
		op: "status",
		url: options.url,
	});
	console.log(`extension: connected (v${result.version})`);
	console.log(
		formatExtensionUpdate(extensionUpdateStatus(result.version, await latest)),
	);
	console.log(
		`content script: ${result.contentScript ? "running" : "not running (reload the tab, or update the extension)"}`,
	);
}
