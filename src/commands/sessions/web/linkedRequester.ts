import type { IncomingMessage } from "node:http";
import { TRACE_HEADER } from "../shared/newTraceId";

export function linkedRequester(req: IncomingMessage): string {
	return `from=${req.headers["x-assist-linked-from"] ?? "local"} trace=${req.headers[TRACE_HEADER] ?? "none"}`;
}
