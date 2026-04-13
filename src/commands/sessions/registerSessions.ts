import type { Command } from "commander";
import { web as sessionsWeb } from "./web";

export function registerSessions(program: Command): void {
	const cmd = program
		.command("sessions")
		.description("Web dashboard for Claude Code sessions")
		.action(() => sessionsWeb({ port: "3100" }));

	cmd
		.command("web")
		.description("Start the sessions web dashboard")
		.option("-p, --port <number>", "Port to listen on", "3100")
		.action(sessionsWeb);
}
