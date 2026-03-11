import { startWebServer } from "../../../shared/web";
import { handleRequest, prefetch } from "./handleRequest";

export async function web(options: { port: string }): Promise<void> {
	prefetch();
	startWebServer(
		"News web view",
		Number.parseInt(options.port, 10),
		handleRequest,
	);
}
