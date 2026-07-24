import type { IncomingMessage } from "node:http";

export async function readRequestBuffer(
	req: IncomingMessage,
	limit: number,
): Promise<Buffer | null> {
	const chunks: Buffer[] = [];
	let size = 0;
	for await (const chunk of req) {
		const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
		size += buf.length;
		if (size > limit) {
			req.destroy();
			return null;
		}
		chunks.push(buf);
	}
	return Buffer.concat(chunks);
}
