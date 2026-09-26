import { LaunchCircuitBreaker } from "../LaunchCircuitBreaker";
import type { LinkContext, NodeLinkDeps } from "./LinkContext";
import { createRelayState } from "./LinkRelayState";
import type { LinkSpec } from "./LinkStatus";

export function createLinkContext(
	spec: LinkSpec,
	deps: NodeLinkDeps,
): LinkContext {
	return {
		spec,
		deps,
		relay: createRelayState(spec.name, deps.viewers, deps.onSessionsChanged),
		breaker: new LaunchCircuitBreaker(`link ${spec.name} ws`),
		socket: null,
		greeted: false,
		state: "disconnected",
		disposed: false,
		connect: () => {},
		onMismatch: () => {},
		onCompatible: () => {},
	};
}
