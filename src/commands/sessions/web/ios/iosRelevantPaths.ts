import { bundledSources } from "../../../extension/bundledSources";

const UI = "src/commands/sessions/web/ui";

const IOS_FIXED_PATHS = [
	"ios-app",
	".github/workflows/ios.yml",
	"src/commands/sessions/web/ios/buildIosWeb.ts",
	"src/commands/sessions/web/getHtml.ts",
	`${UI}/App.tsx`,
	`${UI}/isNativeApp.ts`,
	`${UI}/useNativeStatusBarStyle.ts`,
];

export async function iosRelevantPaths(): Promise<string[]> {
	return [
		...new Set([
			...IOS_FIXED_PATHS,
			...(await bundledSources(`${UI}/PhoneShell.tsx`)),
		]),
	];
}
