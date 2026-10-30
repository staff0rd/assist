import { assistServerUrl, SERVER_URL_KEY } from "./assistServerUrl";
import { attachUserScriptsGrant } from "./attachUserScriptsGrant";
import { extensionStorage } from "./extensionStorage";
import { normalizeServerUrl } from "./normalizeServerUrl";

function element<T extends HTMLElement>(root: ParentNode, selector: string): T {
	const found = root.querySelector<T>(selector);
	if (!found) throw new Error(`options page is missing ${selector}`);
	return found;
}

export async function assistOptions(
	root: ParentNode = document,
): Promise<void> {
	const form = element<HTMLFormElement>(root, "form");
	const input = element<HTMLInputElement>(root, "input[name=serverUrl]");
	const status = element<HTMLElement>(root, "[data-status]");
	input.value = await assistServerUrl();
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const serverUrl = normalizeServerUrl(input.value);
		if (!serverUrl) {
			status.textContent = "Enter an http:// or https:// URL";
			return;
		}
		await extensionStorage()?.set({ [SERVER_URL_KEY]: serverUrl });
		input.value = serverUrl;
		status.textContent = "Saved";
	});
}

if (typeof document !== "undefined" && document.querySelector("form")) {
	void assistOptions();
	void attachUserScriptsGrant();
}
