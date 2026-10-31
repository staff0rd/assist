import { Fragment, type ReactNode } from "react";
import { AddNodeLinkNotice } from "./AddNodeLinkNotice";
import { useAddNodeLink } from "./useAddNodeLink";
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

function LoadedGate({
	homeNode,
	children,
}: {
	homeNode: HomeNodeApi;
	children: ReactNode;
}) {
	const addNodeLink = useAddNodeLink(homeNode.adoptNode);
	return (
		<HomeNodeContext.Provider value={homeNode}>
			<GateScreen homeNode={homeNode}>{children}</GateScreen>
			<AddNodeLinkNotice
				status={addNodeLink.status}
				onClose={addNodeLink.dismiss}
			/>
		</HomeNodeContext.Provider>
	);
}

export function NativeHomeNodeGate({ children }: { children: ReactNode }) {
	const homeNode = useHomeNode();
	if (!homeNode.loaded) return null;
	return <LoadedGate homeNode={homeNode}>{children}</LoadedGate>;
}
