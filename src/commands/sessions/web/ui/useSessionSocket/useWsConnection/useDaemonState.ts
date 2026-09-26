import { useState } from "react";
import type { NodesState } from "../../types";

export function useDaemonState() {
	const [activeByRepo, setActiveByRepo] = useState<Record<string, string>>({});
	const [daemonVersion, setDaemonVersion] = useState<string | null>(null);
	const [nodes, setNodes] = useState<NodesState | null>(null);
	return {
		activeByRepo,
		setActiveByRepo,
		daemonVersion,
		setDaemonVersion,
		nodes,
		setNodes,
	};
}
