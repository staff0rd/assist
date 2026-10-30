import type { browserApi, UserScriptsApi } from "./browserApi";

type Api = NonNullable<ReturnType<typeof browserApi>>;

export async function approvedScriptRunner(
	api: Api,
): Promise<Required<UserScriptsApi> | string> {
	const granted = await api.permissions
		?.contains({ permissions: ["userScripts"] })
		.catch(() => false);
	if (!granted) {
		await api.runtime.openOptionsPage?.().catch(() => undefined);
		return "the assist extension lacks the optional userScripts permission; click Allow scripts on the extension's options page (opened in Firefox now) and run again";
	}
	const execute = api.userScripts?.execute;
	if (!execute)
		return "this Firefox has no userScripts.execute (needs Firefox 153 or later)";
	return { execute: execute.bind(api.userScripts) };
}
