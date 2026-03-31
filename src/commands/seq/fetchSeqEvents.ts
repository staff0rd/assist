import { fetchSeq } from "./fetchSeq";
import type { SeqConnection, SeqEvent } from "./types";

export async function fetchSeqEvents(
	conn: SeqConnection,
	params: URLSearchParams,
): Promise<SeqEvent[]> {
	const response = await fetchSeq(conn, "/api/events", params);
	return response.json();
}
