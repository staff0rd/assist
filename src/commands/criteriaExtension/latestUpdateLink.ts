type GeckoManifest = {
	browser_specific_settings: { gecko: { id: string } };
};

type UpdateManifest = {
	addons: Record<string, { updates: { update_link: string }[] } | undefined>;
};

export function latestUpdateLink(
	manifest: string,
	updates: string,
): string | undefined {
	const { id } = (JSON.parse(manifest) as GeckoManifest)
		.browser_specific_settings.gecko;
	return (JSON.parse(updates) as UpdateManifest).addons[id]?.updates.at(-1)
		?.update_link;
}
