#!/usr/bin/env tsx

import * as fs from "node:fs";
import * as path from "node:path";

interface CommentRecord {
	videoSec: number;
	restGameClock?: string;
	comment: string;
	homeAway: "HOME" | "AWAY";
	isConfirmed?: boolean;
}

interface GameReview {
	gameId: string;
	homeTeamName: string;
	awayTeamName: string;
	periods: {
		[key: string]: CommentRecord[];
	};
}

const OFFSET = 7223; // 120分23秒のオフセット

function fixGameData(inputPath: string, outputPath: string, offset: number) {
	// ファイルを読み込む
	const inputFile = path.resolve(process.cwd(), inputPath);
	if (!fs.existsSync(inputFile)) {
		console.error(`❌ Error: File not found: ${inputFile}`);
		process.exit(1);
	}

	console.log(`📖 Reading: ${inputFile}`);
	const rawData = fs.readFileSync(inputFile, "utf-8");
	const data: GameReview = JSON.parse(rawData);

	// データを修正
	const fixedData: GameReview = {
		...data,
		periods: {},
	};

	for (const [period, records] of Object.entries(data.periods)) {
		fixedData.periods[period] = records.map((record) => {
			// isConfirmedを除外し、videoSecを調整
			const { isConfirmed, ...cleanRecord } = record as CommentRecord & {
				isConfirmed?: boolean;
			};
			return {
				...cleanRecord,
				videoSec: cleanRecord.videoSec - offset,
			};
		});
	}

	// 出力ファイルに書き込む
	const outputFile = path.resolve(process.cwd(), outputPath);
	fs.writeFileSync(outputFile, JSON.stringify(fixedData, null, 2), "utf-8");

	console.log(`✅ Fixed data written to: ${outputFile}`);
	console.log(`📊 Statistics:`);
	console.log(`   - Offset applied: ${offset} seconds (${Math.floor(offset / 60)} min ${offset % 60} sec)`);

	let totalRecords = 0;
	let recordsWithIsConfirmed = 0;

	for (const records of Object.values(data.periods)) {
		totalRecords += records.length;
		recordsWithIsConfirmed += records.filter(
			(r) => (r as any).isConfirmed !== undefined,
		).length;
	}

	console.log(`   - Total records: ${totalRecords}`);
	console.log(
		`   - Records with 'isConfirmed' removed: ${recordsWithIsConfirmed}`,
	);
}

// コマンドライン引数の処理
const args = process.argv.slice(2);
const inputPath = args[0] || "docs/game.json";
const outputPath = args[1] || "docs/game-fixed.json";
const offset = args[2] ? Number.parseInt(args[2], 10) : OFFSET;

if (Number.isNaN(offset)) {
	console.error("❌ Error: Offset must be a number");
	process.exit(1);
}

fixGameData(inputPath, outputPath, offset);
