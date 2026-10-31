import { StatusBar, Style } from "@capacitor/status-bar";
import { useEffect } from "react";
import { reportCaughtError } from "./clientFailures/reportCaughtError";
import { isNativeApp } from "./isNativeApp";

export function useNativeStatusBarStyle(mode: "light" | "dark"): void {
	useEffect(() => {
		if (!isNativeApp) return;
		void StatusBar.setStyle({
			style: mode === "dark" ? Style.Dark : Style.Light,
		}).catch((error: unknown) => reportCaughtError(error, "status bar style"));
	}, [mode]);
}
