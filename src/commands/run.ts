import { spawn } from "node:child_process";
import { loadConfig, saveConfig } from "../shared/loadConfig.js";

export function run(name: string, args: string[]): void {
	const config = loadConfig();

	if (!config.run || config.run.length === 0) {
		console.error("No run configurations found in assist.yml");
		process.exit(1);
	}

	const runConfig = config.run.find((r) => r.name === name);
	if (!runConfig) {
		console.error(`No run configuration found with name: ${name}`);
		console.error("Available configurations:");
		for (const r of config.run) {
			console.error(`  - ${r.name}`);
		}
		process.exit(1);
	}

	const command = runConfig.command.includes(" ")
		? `"${runConfig.command}"`
		: runConfig.command;

	const allArgs = [...(runConfig.args ?? []), ...args];
	const quotedArgs = allArgs.map((arg) =>
		arg.includes(" ") ? `"${arg}"` : arg,
	);
	const fullCommand = [command, ...quotedArgs].join(" ");

	const child = spawn(fullCommand, [], {
		stdio: "inherit",
		shell: true,
	});

	child.on("close", (code) => {
		process.exit(code ?? 0);
	});

	child.on("error", (err) => {
		console.error(`Failed to execute command: ${err.message}`);
		process.exit(1);
	});
}

export function add(): void {
	// Parse process.argv directly to avoid Commander mangling args with colons
	// Format: assist run add <name> <command> [args...]
	const addIndex = process.argv.indexOf("add");
	if (addIndex === -1 || addIndex + 2 >= process.argv.length) {
		console.error("Usage: assist run add <name> <command> [args...]");
		process.exit(1);
	}

	const name = process.argv[addIndex + 1];
	const command = process.argv[addIndex + 2];
	const args = process.argv.slice(addIndex + 3);

	const config = loadConfig();

	if (!config.run) {
		config.run = [];
	}

	const existing = config.run.find((r) => r.name === name);
	if (existing) {
		console.error(`Run configuration with name "${name}" already exists`);
		process.exit(1);
	}

	const entry: { name: string; command: string; args?: string[] } = {
		name,
		command,
	};
	if (args.length > 0) {
		entry.args = args;
	}

	config.run.push(entry);
	saveConfig(config);

	const display = args.length > 0 ? `${command} ${args.join(" ")}` : command;
	console.log(`Added run configuration: ${name} -> ${display}`);
}
