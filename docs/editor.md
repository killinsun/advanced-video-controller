## メモ機能要件

- メモ機能は、動画ページにサイドバーとして埋め込まれるContent scripts である。
- 再生中の時間をクリックすると、ストップウォッチのラップのようにその時点の時間を取得し、そこに対してメモを入力できる
- 入力したメモは以下JSON形式で保存される
```json
{
	"1Q": [{
			"videoSec": 1000, // 動画の再生秒
			"restGameClock": "08:45",
			"comment": "ここに任意のコメント",
			"homeAway": "AWAY",
	}],
	"2Q": [{
		...
	}]
}
```

```ts
type CommentRecord {
	videoSec: number;
	restGameClock?: string // MM:SS 
	comment: string
	homeAway: HOME | AWAY
}

type GameReview = {
	gameId: string
	homeTeamName: string
	awayTeamName: string
	periods: {
		[string(1 | 2 | 3 | 4)]: CommentRecord[]
	}
}
```

- タブで エディタとJSONビューを切り替えできる
- homeAway はテキストボックス入力後にボタンを2つ設置するため、どちらかを押すことで記録される
