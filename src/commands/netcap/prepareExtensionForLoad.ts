import { cp, readFile, writeFile } from "node:fs/promises";
import { networkInterfaces } from "node:os";
import { join } from "node:path";
import chalk from "chalk";
import { detectPlatform } from "../../lib/detectPlatform";
import { netcapExtensionDir } from "./netcapExtensionDir";

const WSL_WINDOWS_DIR = "/mnt/c/tools/netcap-extension";
const WSL_WINDOWS_PATH = String.raw`C:\tools\netcap-extension`;

function lanIPv4(): string | undefined {
	for (const addrs of Object.values(networkInterfaces())) {
		for (const addr of addrs ?? []) {
			if (addr.family === "IPv4" && !addr.internal) return addr.address;
		}
	}
	return undefined;
}

async function setReceiverHost(
	dir: string,
	host: string,
	port: number,
): Promise<void> {
	const file = join(dir, "background.js");
	const source = await readFile(file, "utf8");
	await writeFile(
		file,
		source.replace(
			/const RECEIVER = "[^"]*";/,
			`const RECEIVER = "http://${host}:${port}/";`,
		),
	);
}

/**
 * Resolve the path the user points the browser at for "load unpacked", with the
 * receiver host/port baked into background.js. Under WSL the browser runs on the
 * Windows host, which cannot reach the receiver on loopback (localhost
 * forwarding is unreliable), so copy the extension to a Windows-accessible
 * directory and target the WSL VM's IP instead.
 */
export async function prepareExtensionForLoad(port: number): Promise<string> {
	const source = netcapExtensionDir();
	if (detectPlatform() !== "wsl") {
		await setReceiverHost(source, "127.0.0.1", port);
		return source;
	}
	const host = lanIPv4();
	if (!host) {
		console.log(
			chalk.yellow("could not determine the WSL IP for the extension"),
		);
		await setReceiverHost(source, "127.0.0.1", port);
		return source;
	}
	try {
		await cp(source, WSL_WINDOWS_DIR, { recursive: true });
		await setReceiverHost(WSL_WINDOWS_DIR, host, port);
		return WSL_WINDOWS_PATH;
	} catch {
		console.log(
			chalk.yellow(`could not copy extension to ${WSL_WINDOWS_PATH}`),
		);
		return source;
	}
}
