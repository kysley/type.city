import { type WordState, WordFinishState } from "types";
import { GameState } from "../state";

function detectAutomatedInput(
	wordsState: WordState[],
	totalTime: number,
): { suspicious: boolean; reason: string | null } {
	const typedWords = wordsState.filter((w) => w.input.length > 0);
	if (typedWords.length < 10) return { suspicious: false, reason: null };

	// Check for suspiciously consistent input lengths
	const inputLengths = typedWords.map((w) => w.input.length);
	const avgInputLength =
		inputLengths.reduce((sum, len) => sum + len, 0) / inputLengths.length;
	const inputLengthVariance =
		inputLengths.reduce(
			(sum, len) => sum + Math.pow(len - avgInputLength, 2),
			0,
		) / inputLengths.length;

	if (inputLengthVariance < 0.5 && typedWords.length > 20) {
		return {
			suspicious: true,
			reason: "Suspiciously consistent input lengths",
		};
	}

	// Check for unnaturally consistent typing speed
	const wordsPerMinute = (typedWords.length / totalTime) * 60;
	const perfectWords = typedWords.filter((w) => w.input === w.word).length;
	const perfectRatio = perfectWords / typedWords.length;

	if (wordsPerMinute > 100 && perfectRatio > 0.95 && typedWords.length > 30) {
		return {
			suspicious: true,
			reason: "Consistently high speed with near-perfect accuracy",
		};
	}

	return { suspicious: false, reason: null };
}

function analyzeWordLengthImpact(wordsState: WordState[]): {
	suspicious: boolean;
	reason: string | null;
} {
	const completedWords = wordsState.filter(
		(w) => w.input.length === w.word.length,
	);
	if (completedWords.length < 20) return { suspicious: false, reason: null };

	const wordLengths = completedWords.map((w) => w.word.length);
	const typingSpeeds = completedWords.map(
		(w) => w.input.length / w.word.length,
	); // Simplified speed metric

	// Calculate correlation between word length and typing speed
	const correlation = calculateCorrelation(wordLengths, typingSpeeds);

	if (
		Math.abs(correlation) < 0.1
		// && completedWords.length > 50
	) {
		return {
			suspicious: true,
			reason: "No correlation between word length and typing speed",
		};
	}

	return { suspicious: false, reason: null };
}

function analyzeTypingVariability(wordsState: WordState[]): {
	suspicious: boolean;
	reason: string | null;
} {
	const completedWords = wordsState.filter(
		(w) => w.finishState !== WordFinishState.UNFINISHED,
	);
	// if (completedWords.length < 20) return { suspicious: false, reason: null };

	const typingSpeeds = completedWords.map(
		(w) => w.input.length / w.word.length,
	);
	const avgSpeed =
		typingSpeeds.reduce((sum, speed) => sum + speed, 0) / typingSpeeds.length;
	const speedVariance =
		typingSpeeds.reduce(
			(sum, speed) => sum + Math.pow(speed - avgSpeed, 2),
			0,
		) / typingSpeeds.length;

	// Check for suspiciously low variance in typing speed
	if (
		speedVariance < 0.05
		// && completedWords.length > 30
	) {
		return { suspicious: true, reason: "Unnaturally consistent typing speed" };
	}

	// Check for lack of normal speed fluctuations
	const speedChanges = typingSpeeds
		.slice(1)
		.map((speed, i) => Math.abs(speed - typingSpeeds[i]));
	const avgSpeedChange =
		speedChanges.reduce((sum, change) => sum + change, 0) / speedChanges.length;

	if (
		avgSpeedChange < 0.1
		// && completedWords.length > 40
	) {
		return { suspicious: true, reason: "Lack of natural speed fluctuations" };
	}

	return { suspicious: false, reason: null };
}

function calculateCorrelation(x: number[], y: number[]): number {
	const n = x.length;
	const sumX = x.reduce((a, b) => a + b, 0);
	const sumY = y.reduce((a, b) => a + b, 0);
	const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
	const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
	const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

	const numerator = n * sumXY - sumX * sumY;
	const denominator = Math.sqrt(
		(n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY),
	);

	return numerator / denominator;
}

function detectCheating(gameState: {
	wordsState: WordState[];
	startTime: number;
	currentIndex: number;
	mistakes: number;
}): {
	cheating: boolean;
	reason: string | null;
} {
	const { wordsState, currentIndex, mistakes, startTime } = gameState;
	const totalTime = (Date.now() - startTime) / 1000; // in seconds

	const automatedInputCheck = detectAutomatedInput(wordsState, totalTime);
	if (automatedInputCheck.suspicious) {
		return { cheating: true, reason: automatedInputCheck.reason };
	}

	const wordLengthImpactCheck = analyzeWordLengthImpact(wordsState);
	if (wordLengthImpactCheck.suspicious) {
		return { cheating: true, reason: wordLengthImpactCheck.reason };
	}

	const typingVariabilityCheck = analyzeTypingVariability(wordsState);
	if (typingVariabilityCheck.suspicious) {
		return { cheating: true, reason: typingVariabilityCheck.reason };
	}

	// Additional overall checks
	const totalCharactersTyped = wordsState.reduce(
		(sum, word) => sum + word.input.length,
		0,
	);
	const typingSpeed = totalCharactersTyped / totalTime;
	const errorRate = mistakes / totalCharactersTyped;

	if (typingSpeed > 20 && errorRate < 0.01 && totalCharactersTyped > 500) {
		return {
			cheating: true,
			reason: "Sustained high speed with very low error rate",
		};
	}

	return { cheating: false, reason: null };
}

export { detectCheating };
