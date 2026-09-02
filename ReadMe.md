# Google App Script & kintone

GoogleAppScriptとkintoneのコラボレーション構築例です。
claspを利用します。

https://github.com/google/clasp

**Googleカレンダーの予定を kintone アプリへ一方向で同期します。** カレンダー側を正として、
kintone のレコードを作成・更新・削除します。kintone 側の編集はカレンダーへ戻りません。

## 同期の仕組み

`main()` を実行すると次の順で処理します。定期実行するならGASのトリガーに `main` を設定してください。

1. **前回の同期時刻を取る** — kintoneアプリを `連携日時` の降順で1件だけ引きます
2. **カレンダーの予定を取る** — **実行日から3年後まで**が対象です
3. **kintoneのレコードを取る** — 同じ期間（`開始日時` >= 開始 かつ `終了日時` <= 終了）
4. **前回の同期以降に更新された予定だけ**を選び、`eventId` で既存レコードを探します
   - 見つからない → 作成
   - 見つかった → 更新
5. **カレンダーに存在しないレコードを削除**します
6. 作成・更新・削除の件数をログに残します

作成・更新・削除はいずれも **100件ずつ**に分けて送ります。

## installのしかた

### パッケージインストール

```
npm i
```

### ソースの環境変数

`0.env.js` の変数を適切に変えてください。

| 変数 | 内容 |
|---|---|
| `calId` | 同期元のGoogleカレンダーID |
| `logBookUrl` | ログを書き出すスプレッドシートのURL |
| `kintone.baseUrl` | `https://***.cybozu.com` |
| `kintone.apiToken` | **レコードの追加・編集・削除**の権限が必要です |
| `kintone.appId` | 同期先のアプリID |
| `kintone.basicUsername` / `basicPassword` | ベーシック認証。無い場合は空文字 |

### kintoneアプリ

`/kintone` にアプリテンプレートがあります。ご利用ください。
GoogleCalendarのプロパティとkintoneアプリのフィールドのマッピングは
`1.converters.js` を見てください。

同期に使うフィールドは次の7つです。

| フィールドコード | 中身 |
|---|---|
| `eventId` | カレンダーのイベントID。**レコードを突き合わせるキー** |
| `タイトル` | 予定のタイトル |
| `開始日時` / `終了日時` | ISO8601形式 |
| `備考` | 予定の説明と、**ゲストのメールアドレス**を改行でつなげたもの |
| `イベントURL` | Googleカレンダーの予定を開くリンク |
| `連携日時` | 同期した時刻。**次回の差分判定に使う**ので消さないでください |

## コマンドの説明

### clone

既存のAppScriptプロジェクトとリンクします。

### push

**ローカルのソースを、リンクされたプロジェクトへアップロードします。**

### pull

**リンクされたプロジェクトのソースを、ローカルへダウンロードします。**

## ソースの構成

**ファイル名の先頭の数字は読み込み順です。** GASはファイル名順に評価するため、
`env` や `libs` を先に定義しておく必要があります。

| ファイル | 中身 |
|---|---|
| `0.env.js` | 設定値 |
| `0.main.js` | 同期の本体。GASのトリガーはこの `main` を呼びます |
| `1.converters.js` | カレンダーの予定 → kintoneレコードへの変換 |
| `2.libs.js` | カレンダーの取得と、スプレッドシートへのログ出力 |
| `3.kintone.js` | kintone REST API の呼び出し |

### 実装上のポイント

- **PUT / DELETE は POST として送っています。** `x-http-method-override` ヘッダに本来のメソッドを入れる形です
- **レコードの取得はカーソルAPI**で、500件ずつ取得して再帰的に繰り返します
- **ログはスプレッドシートに追記**します。1000行を超えると先頭行から削除します（`2.libs.js`）
- イベントURLは、イベントIDとカレンダーIDをbase64エンコードして組み立てます（`getCalenderEventLink`）

## 既知の問題

- [#1](https://github.com/IshigiwaKenichiro/google-calendar-and-kintone/issues/1) — **kintoneアプリが空のとき `main()` が `TypeError` で落ちます。**
  初回実行がこの状態にあたります
- [#2](https://github.com/IshigiwaKenichiro/google-calendar-and-kintone/issues/2) — ベーシック認証のヘッダ名が `authentication` になっています。
  ベーシック認証を使う環境では認証が通りません
