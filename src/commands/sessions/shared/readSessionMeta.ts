import type * as fs from "node:fs";
import { extractSessionMeta } from "./extractSessionMeta";

type SessionMeta = ReturnType<typeof extractSessionMeta>;

const GROWING_HEAD_SIZES = [16_384, 262_144, 2_097_152];

export async function readSessionMeta(
	handle: fs.promises.FileHandle,
): Promise<SessionMeta> {
	let meta = extractSessionMeta([]);
	for (const size of GROWING_HEAD_SIZES) {
		const buf = Buffer.alloc(size);
		const { bytesRead } = await handle.read(buf, 0, size, 0);
		meta = extractSessionMeta(
			buf.toString("utf8", 0, bytesRead).split("\n").filter(Boolean),
		);
		if (bytesRead < size || hasCwdAndFirstPrompt(meta)) break;
	}
	return meta;
}

function hasCwdAndFirstPrompt(meta: SessionMeta): boolean {
	return Boolean(meta.cwd && (meta.name || meta.commandName));
}
