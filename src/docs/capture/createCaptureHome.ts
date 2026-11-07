import {
	copyFileSync,
	mkdtempSync,
	realpathSync,
	writeFileSync,
} from "node:fs";
import type { Server } from "node:http";
import type { Socket } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { CaptureNewsFeed } from "../captureSetupStepSchema";
import { docsPaths } from "../docsPaths";
import { captureEnv } from "./captureEnv";
import { cloneCaptureRepos } from "./cloneCaptureRepos";

type CapturePeer = {
	capture: CaptureHome;
	url: string;
	stop: () => Promise<void>;
};

export type CaptureHome = {
	home: string;
	reposDir: string;
	sandbox: string;
	env: NodeJS.ProcessEnv;
	databaseUrl: string;
	sessionIds: Map<string, string>;
	openPreviews: Socket[];
	peers: Map<string, CapturePeer>;
	linkedPeers: Set<string>;
	newsFeeds: Map<string, CaptureNewsFeed>;
	apiStubs: Map<string, unknown>;
	feedServer?: Server;
};

function socketPathSafeTempDir(): string {
	return process.platform === "win32" ? tmpdir() : "/tmp";
}

export function createCaptureHome(databaseUrl: string): CaptureHome {
	const home = realpathSync(
		mkdtempSync(join(socketPathSafeTempDir(), "assist-docs-")),
	);
	const env = captureEnv(home, databaseUrl);
	copyFileSync(docsPaths.captureConfig, join(home, ".assist.yml"));
	writeFileSync(
		join(home, ".gitconfig"),
		"[user]\n\tname = Sandbox\n\temail = sandbox@example.com\n",
	);
	const reposDir = join(home, "repos");
	const sandbox = cloneCaptureRepos(reposDir, env);
	return {
		home,
		reposDir,
		sandbox,
		env,
		databaseUrl,
		sessionIds: new Map(),
		openPreviews: [],
		peers: new Map(),
		linkedPeers: new Set(),
		newsFeeds: new Map(),
		apiStubs: new Map(),
	};
}
