import type { BrowserContext } from "playwright";
import { phoneCaptureFlag } from "../../commands/sessions/web/ui/phoneCaptureFlag";

const TAILNET = "tail1234.ts.net:3100";
const TAILNET_HOST =
	String.raw`[a-z0-9-]+\.` + TAILNET.replaceAll(".", String.raw`\.`);

const tailnetUrl = (name: string) =>
	["https:", "", `${name}.${TAILNET}`].join("/");

function seedNodesScript(names: string[]): string {
	const nodes = names.map((name) => ({ name, url: tailnetUrl(name) }));
	const seed = nodes[0]
		? `
		localStorage.setItem("CapacitorStorage.savedNodes", ${JSON.stringify(JSON.stringify(nodes))});
		localStorage.setItem("CapacitorStorage.homeNodeUrl", ${JSON.stringify(nodes[0].url)});`
		: "";
	return `localStorage.setItem(${JSON.stringify(phoneCaptureFlag)}, "1");${seed}`;
}

function tailnetToCaptureServerScript(baseUrl: string): string {
	return `
		const tailnetHttp = new RegExp(${JSON.stringify(`^https:[/]{2}${TAILNET_HOST}`)});
		const tailnetWs = new RegExp(${JSON.stringify(`^wss:[/]{2}${TAILNET_HOST}`)});
		const toCaptureServer = (url) => url
			.replace(tailnetHttp, ${JSON.stringify(baseUrl)})
			.replace(tailnetWs, ${JSON.stringify(baseUrl.replace(/^http/, "ws"))});
		const fetchOriginal = globalThis.fetch.bind(globalThis);
		globalThis.fetch = (input, init) => fetchOriginal(
			typeof input === "string" || input instanceof URL ? toCaptureServer(String(input)) : input,
			init,
		);
		const WebSocketOriginal = globalThis.WebSocket;
		globalThis.WebSocket = class extends WebSocketOriginal {
			constructor(url, protocols) {
				super(toCaptureServer(String(url)), protocols);
			}
		};
	`;
}

export async function seedPhoneNodes(
	context: BrowserContext,
	baseUrl: string,
	names: string[],
): Promise<void> {
	await context.addInitScript({
		content: seedNodesScript(names) + tailnetToCaptureServerScript(baseUrl),
	});
}
