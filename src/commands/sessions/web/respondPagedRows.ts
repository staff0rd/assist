import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";

const DEFAULT_PAGE_SIZE = 30;

type PageRange = { limit: number; offset: number };

export async function respondPagedRows<T>(
	req: IncomingMessage,
	res: ServerResponse,
	load: (
		range: PageRange,
		params: URLSearchParams,
	) => Promise<[rows: T[], total: number]>,
): Promise<void> {
	const params = new URL(req.url ?? "/", "http://localhost").searchParams;
	const page = Math.max(0, Number(params.get("page")) || 0);
	const limit = Number(params.get("pageSize")) || DEFAULT_PAGE_SIZE;
	const [rows, total] = await load({ limit, offset: page * limit }, params);
	respondJson(res, 200, { rows, total });
}
