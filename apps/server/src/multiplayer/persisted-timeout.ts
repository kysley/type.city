type TimerCallback = () => void;

class TimerManager {
	private timers: Map<string, NodeJS.Timeout>;

	constructor() {
		this.timers = new Map();
	}

	setPersistedTimeout(
		key: string,
		callback: TimerCallback,
		delay: number,
	): void {
		const timeoutId = setTimeout(() => {
			callback();
			this.timers.delete(key);
		}, delay);

		this.timers.set(key, timeoutId);
	}

	clearPersistedTimeout(key: string): void {
		const timeoutId = this.timers.get(key);
		if (timeoutId) {
			clearTimeout(timeoutId);
			this.timers.delete(key);
		}
	}
}

// Usage
const timerManager = new TimerManager();

export { timerManager };
