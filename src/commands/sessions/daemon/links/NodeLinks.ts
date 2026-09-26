import { loadConfig } from "../../../../shared/loadConfig";
import { resolveNodeName } from "../../shared/resolveNodeName";
import { broadcast, type SessionClient, sendTo } from "../broadcast";
import type { ClientHub } from "../ClientHub";
import { linkDeps, type NodeLinksOptions } from "./linkDeps";
import type { NodesMessage } from "./LinkStatus";
import { NodeLink } from "./NodeLink";
import { reconcileLinks } from "./reconcileLinks";
import { routeToLink } from "./routeToLink";

export class NodeLinks {
	private readonly links = new Map<string, NodeLink>();
	private options: NodeLinksOptions = {};

	constructor(
		private readonly clients: ClientHub,
		private readonly onSessionsChanged: () => void,
	) {}

	configure(options: NodeLinksOptions): void {
		this.options = options;
	}

	reload(): void {
		const specs = this.options.specs?.() ?? loadConfig().sessions?.links ?? [];
		const deps = linkDeps(this.options, {
			viewers: () => this.clients.viewers(),
			onSessionsChanged: this.onSessionsChanged,
			onStateChanged: () => broadcast(this.clients.viewers(), this.nodes()),
		});
		reconcileLinks(this.links, specs, (spec) => new NodeLink(spec, deps));
		this.onSessionsChanged();
		broadcast(this.clients.viewers(), this.nodes());
	}

	private all = () => [...this.links.values()];
	private localNode = () => this.options.localNode?.() ?? resolveNodeName();

	sessions = () => this.all().flatMap((link) => link.sessions());

	replayScrollback(client: SessionClient): void {
		for (const link of this.all()) link.replayScrollback(client);
	}

	history = async () =>
		(await Promise.all(this.all().map((link) => link.history()))).flat();

	nodes = (): NodesMessage => ({
		type: "nodes",
		local: this.localNode(),
		links: this.all().map((link) => link.status()),
	});

	sendNodes = (client: SessionClient) => sendTo(client, this.nodes());

	route(client: SessionClient, data: Record<string, unknown>): boolean {
		if (this.clients.isPeer(client)) return false;
		return routeToLink(this.links, this.localNode(), client, data);
	}

	dispose(): void {
		for (const link of this.all()) link.dispose();
		this.links.clear();
	}
}
