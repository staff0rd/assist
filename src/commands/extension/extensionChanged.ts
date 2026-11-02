import { execFileSync } from "node:child_process";
import {
	appendFileSync,
	mkdtempSync,
	readFileSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { changedBundleFiles } from "./changedBundleFiles";
import { latestUpdate } from "./latestUpdate";
import { readBundleFiles } from "./readBundleFiles";

function lastSignedUpdate() {
	const updates = execFileSync(
		"git",
		["show", "origin/main:extension/updates.json"],
		{ encoding: "utf8" },
	);
	return latestUpdate(readFileSync("extension/manifest.json", "utf8"), updates);
}

async function unpackSignedXpi(link: string): Promise<string | undefined> {
	const response = await fetch(link);
	if (!response.ok) return undefined;
	const dir = mkdtempSync(join(tmpdir(), "assist-signed-"));
	const xpi = join(dir, "signed.xpi");
	writeFileSync(xpi, Buffer.from(await response.arrayBuffer()));
	const unpacked = join(dir, "unpacked");
	execFileSync("unzip", ["-q", xpi, "-d", unpacked]);
	return unpacked;
}

export async function extensionChanged(): Promise<boolean> {
	const signed = lastSignedUpdate();
	if (!signed) {
		console.log("No signed version recorded; signing.");
		return true;
	}
	const unpacked = await unpackSignedXpi(signed.update_link);
	if (!unpacked) {
		console.log(`Could not download v${signed.version}; signing.`);
		return true;
	}
	const changed = changedBundleFiles(
		readBundleFiles("extension"),
		readBundleFiles(unpacked),
	);
	if (changed.length === 0) {
		console.log(`Built extension matches v${signed.version}; skipping.`);
		return false;
	}
	console.log(`Built extension differs from v${signed.version}:`);
	for (const path of changed) console.log(`  ${path}`);
	return true;
}

const changed = await extensionChanged();
if (process.env.GITHUB_OUTPUT)
	appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed}\n`);
