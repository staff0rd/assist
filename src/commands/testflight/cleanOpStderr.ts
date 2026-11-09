const wslWrapperNoise = [
	/^'\\\\wsl[.$]/i,
	/^CMD\.EXE was started with the above path/i,
	/^UNC paths are not supported/i,
];

export function cleanOpStderr(stderr: string): string {
	return stderr
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line && !wslWrapperNoise.some((re) => re.test(line)))
		.join("\n");
}
