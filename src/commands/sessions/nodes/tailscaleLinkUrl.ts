import { tailnetSuffix } from "./tailnetSuffix";
import { tailscaleStatus } from "./tailscaleStatus";

async function localTailnetSuffix(): Promise<string> {
	return tailnetSuffix(await tailscaleStatus());
}

export async function tailscaleLinkUrl(
	host: string,
	port: number,
	resolveSuffix: () => Promise<string> = localTailnetSuffix,
): Promise<string> {
	const suffix = await resolveSuffix();
	const fqdn = host.replace(/\.$/, "");
	const bare = fqdn.endsWith(`.${suffix}`)
		? fqdn.slice(0, -suffix.length - 1)
		: fqdn;
	return `https://${bare}.${suffix}:${port}`;
}
