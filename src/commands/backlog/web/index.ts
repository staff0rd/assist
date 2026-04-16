import { web as sessionsWeb } from "../../sessions/web";

export async function web(options: { port: string }): Promise<void> {
	await sessionsWeb({ port: options.port, initialPath: "/backlog" });
}
