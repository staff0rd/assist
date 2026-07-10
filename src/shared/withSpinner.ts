const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const TICK_MS = 80;

export async function withSpinner<T>(
	text: string,
	task: () => Promise<T>,
): Promise<T> {
	if (!process.stderr.isTTY) return task();

	let frame = 0;
	const render = () => {
		process.stderr.write(`\r${SPINNER_FRAMES[frame]} ${text}`);
	};
	render();
	const timer = setInterval(() => {
		frame = (frame + 1) % SPINNER_FRAMES.length;
		render();
	}, TICK_MS);

	try {
		return await task();
	} finally {
		clearInterval(timer);
		process.stderr.write("\r\x1b[K");
	}
}
