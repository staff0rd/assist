import { daemonLog } from "./daemonLog";

const MAX_FAILURES = 3;
const BACKOFF_MS = 60_000;

export class LaunchCircuitBreaker {
	private failures = 0;
	private until = 0;
	private lastCause = "";

	constructor(private readonly label: string) {}

	tripped(): boolean {
		return this.failures >= MAX_FAILURES && Date.now() < this.until;
	}

	remainingMs(): number {
		return Math.max(this.until - Date.now(), 0);
	}

	reason(): string {
		const secs = Math.ceil(this.remainingMs() / 1000);
		const summary = `${this.failures} times in a row; not retrying for ${secs}s`;
		return this.lastCause
			? `${this.lastCause} (failed ${summary})`
			: `${this.label} failed ${summary}`;
	}

	clear(): void {
		this.failures = 0;
		this.until = 0;
		this.lastCause = "";
	}

	fail(cause: string): void {
		this.failures++;
		this.lastCause = cause;
		if (this.failures < MAX_FAILURES) return;
		this.until = Date.now() + BACKOFF_MS;
		daemonLog(
			`${this.label}: ${this.failures} consecutive failures; backing off ${BACKOFF_MS / 1000}s; last error: ${cause}`,
		);
	}
}
