import { Fragment, type ReactNode } from "react";
import { HomeNodeConnecting } from "./HomeNodeConnecting";
import { HomeNodeContext } from "./useHomeNodeContext";
import { HomeNodeSetup } from "./HomeNodeSetup";
import { HomeNodeUnreachable } from "./HomeNodeUnreachable";
import { type HomeNodeApi, useHomeNode } from "./useHomeNode";

function GateScreen({
	homeNode,
	children,
}: {
	homeNode: HomeNodeApi;
	children: ReactNode;
}) {
	const { home, connection } = homeNode;
	if (!home) return <HomeNodeSetup onConnect={homeNode.connectFirstNode} />;
	if (connection.kind === "probing")
		return <HomeNodeConnecting name={home.name} />;
	if (connection.kind === "unreachable")
		return (
			<HomeNodeUnreachable
				homeNode={homeNode}
				home={home}
				error={connection.error}
				retryAt={connection.retryAt}
			/>
		);
	return <Fragment key={home.url}>{children}</Fragment>;
}

export function NativeHomeNodeGate({ children }: { children: ReactNode }) {
	const homeNode = useHomeNode();
	if (!homeNode.loaded) return null;
	return (
		<HomeNodeContext.Provider value={homeNode}>
			<GateScreen homeNode={homeNode}>{children}</GateScreen>
		</HomeNodeContext.Provider>
	);
}
