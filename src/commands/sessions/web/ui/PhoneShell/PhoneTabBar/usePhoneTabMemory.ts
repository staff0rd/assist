import { useEffect, useRef } from "react";
import { useLocation } from "react-router";
import { owningPhoneTab } from "./owningPhoneTab";

export function usePhoneTabMemory() {
	const { pathname, search } = useLocation();
	const lastPaths = useRef(new Map<string, string>());

	useEffect(() => {
		lastPaths.current.set(owningPhoneTab(pathname), pathname + search);
	}, [pathname, search]);

	return (tabPath: string) => lastPaths.current.get(tabPath) ?? tabPath;
}
