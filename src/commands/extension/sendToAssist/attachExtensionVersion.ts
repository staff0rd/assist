import gt from "semver/functions/gt";
import valid from "semver/functions/valid";
import { extensionRuntime } from "./extensionRuntime";
import { fetchLatestExtension } from "./fetchLatestExtension";

function manifestVersion(): string | undefined {
	try {
		return extensionRuntime()?.getManifest?.().version;
	} catch {
		return undefined;
	}
}

function installLink(href: string): HTMLAnchorElement {
	const link = document.createElement("a");
	link.href = href;
	link.textContent = "Install";
	return link;
}

export async function attachExtensionVersion(
	root: ParentNode = document,
): Promise<void> {
	const element = root.querySelector<HTMLElement>("[data-version]");
	if (!element) return;
	const installed = manifestVersion();
	if (!installed) {
		element.textContent = "assist unknown";
		return;
	}
	element.textContent = `assist v${installed}`;
	const latest = await fetchLatestExtension();
	if (!latest || !valid(latest.version) || !valid(installed)) {
		element.textContent = `assist v${installed} · couldn't check for updates (server unreachable)`;
		return;
	}
	if (!gt(latest.version, installed)) {
		element.textContent = `assist v${installed} · up to date`;
		return;
	}
	element.textContent = `assist v${installed} installed · v${latest.version} available `;
	if (latest.installLink) element.append(installLink(latest.installLink));
}
