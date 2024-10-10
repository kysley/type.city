class DailyLeaderboard {
	private maxSize: number;
	private scores: [number, string][];

	constructor(maxSize = 100) {
		this.maxSize = maxSize;
		this.scores = [];
	}

	addScore(username: string, score: number): void {
		// remove existing score for the user
		const existingIndex = this.scores.findIndex(
			([_, user]) => user === username,
		);
		if (existingIndex !== -1) {
			// Players existing score is higher than the new score
			if (this.scores[existingIndex][0] > score) return;
			this.scores.splice(existingIndex, 1);
		}

		// Add the new score
		const insertIndex = this.scores.findIndex(([s, _]) => score > s);
		if (insertIndex === -1) {
			if (this.scores.length < this.maxSize) {
				this.scores.push([score, username]);
			}
		} else {
			this.scores.splice(insertIndex, 0, [score, username]);
			if (this.scores.length > this.maxSize) {
				this.scores.pop();
			}
		}
	}

	getLeaderboard(): [number, string][] {
		return this.scores;
	}

	getByUsername(username: string): number | null {
		const entry = this.scores.find(([_, user]) => user === username);
		return entry ? entry[0] : null;
	}

	reset(): void {
		this.scores = [];
	}
}

// Example usage
const leaderboard = new DailyLeaderboard();

export { leaderboard };
