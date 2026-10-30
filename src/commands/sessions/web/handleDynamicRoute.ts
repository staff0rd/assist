import type { IncomingMessage, ServerResponse } from "node:http";
import { handleItemRoute } from "../../backlog/web/handleItemRoute";
import { allowAppOrigin } from "./allowAppOrigin";
import { handleInboxRoute } from "./inbox/handleInboxRoute";
import { proxyToNode } from "./proxyToNode";

export async function handleDynamicRoute(
	req: IncomingMessage,
	res: ServerResponse,
	pathname: string,
): Promise<boolean> {
	return (
		allowAppOrigin(req, res, pathname) ||
		(await proxyToNode(req, res)) ||
		(await handleInboxRoute(req, res, pathname)) ||
		handleItemRoute(req, res, pathname)
	);
}
