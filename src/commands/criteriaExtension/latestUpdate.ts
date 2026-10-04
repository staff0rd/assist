type GeckoManifest = {
	browser_specific_settings: { gecko: { id: string } };
};

type Update = { version: string; update_link: string };

type UpdateManifest = {
	addons: Record<string, { updates: Update[] } | undefined>;
};

export function latestUpdate(
	manifest: string,
	updates: string,
): Update | undefined {
	const { id } = (JSON.parse(manifest) as GeckoManifest)
		.browser_specific_settings.gecko;
	return (JSON.parse(updates) as UpdateManifest).addons[id]?.updates.at(-1);
}
