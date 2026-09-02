import { useState } from "react";

export function useDaemonState() {
	const [activeByRepo, setActiveByRepo] = useState<Record<string, string>>({});
	const [daemonVersion, setDaemonVersion] = useState<string | null>(null);
	return {
		activeByRepo,
		setActiveByRepo,
		daemonVersion,
		setDaemonVersion,
	};
}
