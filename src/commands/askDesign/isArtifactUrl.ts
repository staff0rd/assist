const ARTIFACT_PATH = /^\/(code\/)?artifact\/[\w-]+\/?$/;

export function isArtifactUrl(value: string): boolean {
	let url: URL;
	try {
		url = new URL(value);
	} catch {
		return false;
	}
	return (
		url.protocol === "https:" &&
		url.hostname === "claude.ai" &&
		ARTIFACT_PATH.test(url.pathname)
	);
}
