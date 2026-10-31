import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { owningPhoneTab } from "./owningPhoneTab";

export function usePhoneTabMemory() {
	const { pathname, search } = useLocation();
	const lastPaths = useRef(new Map<string, string>());
	const rootPaths = useRef(new Map<string, string>());

	useEffect(() => {
		const tab = owningPhoneTab(pathname);
		lastPaths.current.set(tab, pathname + search);
		if (pathname === tab) rootPaths.current.set(tab, pathname + search);
	}, [pathname, search]);

	return (tabPath: string): string[] => {
		const last = lastPaths.current.get(tabPath) ?? tabPath;
		const root = rootPaths.current.get(tabPath) ?? tabPath;
		return new URL(last, "http://x").pathname === tabPath
			? [last]
			: [root, last];
	};
}
