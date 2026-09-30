import type { IncomingMessage, ServerResponse } from "node:http";
import { loadConfigFrom } from "../../../../shared/loadConfigFrom";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { fetchPeerPrs } from "./fetchPeerPrs";
import type { NextResponse, NextSection } from "./types";

function errorMessage(error: unknown): string {
	const stderr = (error as { stderr?: unknown }).stderr;
	if (typeof stderr === "string" && stderr.trim()) return stderr.trim();
	return error instanceof Error ? error.message : String(error);
}

async function section<T>(load: () => Promise<T[]>): Promise<NextSection<T>> {
	try {
		return { items: await load(), error: null };
	} catch (error) {
		return { items: [], error: errorMessage(error) };
	}
}

export async function nextItems(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const peers = loadConfigFrom(cwd).next?.peers ?? [];
	const body: NextResponse = {
		peerPrs: await section(() => fetchPeerPrs(cwd, peers)),
	};
	respondJson(res, 200, body);
}
