import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";

const DEFAULT_PAGE_SIZE = 30;

type PageRange = { limit: number; offset: number };

export async function respondPagedRows<P extends { total: number }>(
	req: IncomingMessage,
	res: ServerResponse,
	load: (range: PageRange, params: URLSearchParams) => Promise<P>,
): Promise<void> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const page = Math.max(0, Number(params.get("page")) || 0);
	const limit = Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE;
	respondJson(res, 200, await load({ limit, offset: page * limit }, params));
}
