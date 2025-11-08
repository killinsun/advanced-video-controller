export type Period = "1" | "2" | "3" | "4";

export interface CommentRecord {
	videoSec: number;
	restGameClock?: string; // MM:SS
	comment: string;
	homeAway: "HOME" | "AWAY";
}

export interface GameReview {
	gameId: string;
	homeTeamName: string;
	awayTeamName: string;
	periods: {
		[key: string]: CommentRecord[]; // "1", "2", "3", "4"
	};
}
