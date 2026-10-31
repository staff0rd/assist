import { phoneTabs } from "./phoneTabs";

export function owningPhoneTab(pathname: string): string {
	const tab = phoneTabs.find(
		({ path }) =>
			path !== "/" && (pathname === path || pathname.startsWith(`${path}/`)),
	);
	return tab?.path ?? "/";
}
