import type { IncomingMessage, ServerResponse } from "node:http";
import { corsHeaders } from "./corsHeaders";
import { handleNetcapPost } from "./handleNetcapPost";
import type { NetcapHandlerOptions } from "./types";

/**
 * Request handler for the netcap receiver. The extension's background worker
 * POSTs captured entries here (outside the page CSP), GET is a connectivity
 * ping, and OPTIONS is the CORS preflight.
 */
export function createNetcapHandler(
	options: NetcapHandlerOptions,
): (req: IncomingMessage, res: ServerResponse) => void {
	return (req, res) => {
		if (req.method === "OPTIONS") {
			res.writeHead(204, corsHeaders);
			res.end();
			return;
		}
		if (req.method === "GET") {
			options.onPing?.(req);
			res.writeHead(200, { ...corsHeaders, "Content-Type": "text/plain" });
			res.end("netcap receiver");
			return;
		}
		if (req.method !== "POST") {
			res.writeHead(405, corsHeaders);
			res.end();
			return;
		}
		handleNetcapPost(req, res, options);
	};
}
