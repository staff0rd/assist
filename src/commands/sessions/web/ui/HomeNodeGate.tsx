import { Capacitor } from "@capacitor/core";
import { Preferences } from "@capacitor/preferences";
import { type ReactNode, useEffect, useState } from "react";
import { setApiBase } from "./apiUrl";
import { HomeNodeSetup } from "./HomeNodeGate/HomeNodeSetup";

const HOME_NODE_KEY = "homeNodeUrl";
const isApp = Capacitor.isNativePlatform();

export function HomeNodeGate({ children }: { children: ReactNode }) {
	const [homeNode, setHomeNode] = useState<string | null | undefined>(
		isApp ? undefined : "",
	);

	const connect = (url: string) => {
		setApiBase(url);
		setHomeNode(url);
	};

	useEffect(() => {
		if (!isApp) return;
		Preferences.get({ key: HOME_NODE_KEY })
			.then(({ value }) => {
				if (value) connect(value);
				else setHomeNode(null);
			})
			.catch(() => setHomeNode(null));
	}, []);

	if (homeNode === undefined) return null;
	if (homeNode === null)
		return (
			<HomeNodeSetup
				onSave={(url) => {
					void Preferences.set({ key: HOME_NODE_KEY, value: url });
					connect(url);
				}}
			/>
		);
	return children;
}
