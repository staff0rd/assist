import { useState } from "react";

export function useDaemonState() {
	const [daemonActiveId, setDaemonActiveId] = useState<string | null>(null);
	const [daemonVersion, setDaemonVersion] = useState<string | null>(null);
	return {
		daemonActiveId,
		setDaemonActiveId,
		daemonVersion,
		setDaemonVersion,
	};
}
