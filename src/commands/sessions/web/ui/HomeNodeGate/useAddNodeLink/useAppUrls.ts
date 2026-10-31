import { App } from "@capacitor/app";
import { useEffect, useRef } from "react";
import { reportCaughtError } from "../../clientFailures/reportCaughtError";

const LAUNCH_URL_ECHO_MS = 5000;

export function useAppUrls(onUrl: (url: string) => void) {
	const onUrlRef = useRef(onUrl);
	const last = useRef<{ url: string; at: number }>(undefined);

	useEffect(() => {
		onUrlRef.current = onUrl;
	}, [onUrl]);

	useEffect(() => {
		const deliver = (url: string) => {
			const now = Date.now();
			const echo =
				last.current?.url === url && now - last.current.at < LAUNCH_URL_ECHO_MS;
			last.current = { url, at: now };
			if (!echo) onUrlRef.current(url);
		};
		const listener = App.addListener("appUrlOpen", ({ url }) => deliver(url));
		App.getLaunchUrl()
			.then((launch) => {
				if (launch?.url) deliver(launch.url);
			})
			.catch((error: unknown) => reportCaughtError(error, "launch url"));
		return () => {
			void listener.then((l) => l.remove());
		};
	}, []);
}
