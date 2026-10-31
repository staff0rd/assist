import { extensionRuntime } from "./extensionRuntime";

function manifestVersion(): string | undefined {
	try {
		return extensionRuntime()?.getManifest?.().version;
	} catch {
		return undefined;
	}
}

export function attachExtensionVersion(root: ParentNode = document): void {
	const element = root.querySelector<HTMLElement>("[data-version]");
	if (!element) return;
	element.textContent = `assist ${manifestVersion() ?? "unknown"}`;
}
