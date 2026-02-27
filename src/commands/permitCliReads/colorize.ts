import chalk from "chalk";

export function colorize(plainOutput: string): string {
	return plainOutput
		.split("\n")
		.map((line) => {
			if (line.startsWith(" R  ")) return chalk.green(line);
			if (line.startsWith(" W  ")) return chalk.red(line);
			return line;
		})
		.join("\n");
}
