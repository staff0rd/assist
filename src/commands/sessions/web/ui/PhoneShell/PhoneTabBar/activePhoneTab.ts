import { phoneTabs } from "./phoneTabs";

export function activePhoneTab(pathname: string) {
	const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
	return phoneTabs.find((tab) => tab.path === path);
}
