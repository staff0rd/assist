import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import type { CaptureTestflight } from "../captureSetupStepSchema";
import { fakeAppStoreConnectData } from "./fakeAppStoreConnectData";

export async function startFakeAppStoreConnect(
	current: () => CaptureTestflight | undefined,
): Promise<{ server: Server; url: string }> {
	const server = createServer((request, response) => {
		const testflight = current();
		const url = new URL(request.url ?? "/", "http://localhost");
		const data =
			request.method === "GET" && testflight
				? fakeAppStoreConnectData(testflight, url)
				: undefined;
		if (!data) {
			response.writeHead(404, { "content-type": "application/json" });
			response.end(JSON.stringify({ errors: [{ status: "404" }] }));
			return;
		}
		response.writeHead(200, { "content-type": "application/json" });
		response.end(JSON.stringify({ data }));
	});
	await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
	const { port } = server.address() as AddressInfo;
	return { server, url: `http://127.0.0.1:${port}` };
}
