const RELEASE_DOWNLOAD_URL =
	"https://github.com/staff0rd/assist/releases/download";

type ExtensionManifest = {
	browser_specific_settings: { gecko: { id: string } };
};

export function buildUpdateManifest(manifest: string, version: string): string {
	const { id } = (JSON.parse(manifest) as ExtensionManifest)
		.browser_specific_settings.gecko;
	const updates = {
		addons: {
			[id]: {
				updates: [
					{
						version,
						update_link: `${RELEASE_DOWNLOAD_URL}/v${version}/criteria-extension.xpi`,
					},
				],
			},
		},
	};
	return `${JSON.stringify(updates, null, "\t")}\n`;
}
