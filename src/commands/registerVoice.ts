import type { Command } from "commander";
import { devices, logs, setup, start, status, stop } from "./voice";

export function registerVoice(program: Command): void {
	const voiceCommand = program
		.command("voice")
		.description("Voice interaction daemon for hands-free Claude commands");

	voiceCommand
		.command("start")
		.description("Start the voice daemon")
		.option("--foreground", "Run in foreground for debugging")
		.option("--debug", "Enable debug output (live VAD meter, verbose logging)")
		.action((options) => start(options));

	voiceCommand
		.command("setup")
		.description("Download required voice models (VAD, STT)")
		.action(setup);

	voiceCommand
		.command("stop")
		.description("Stop the voice daemon")
		.action(stop);

	voiceCommand
		.command("status")
		.description("Check voice daemon status")
		.action(status);

	voiceCommand
		.command("devices")
		.description("List available audio input devices")
		.action(devices);

	voiceCommand
		.command("logs")
		.description("Tail voice daemon logs")
		.option("-n, --lines <count>", "Number of lines to show", "20")
		.action((options) => logs(options));
}
