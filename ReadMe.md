# Google App Script & kintone
GoogleAppScriptとkintoneのコラボレーション構築例です。
claspを利用します。

https://github.com/google/clasp


# installのしかた
## パッケージインストール
```
npm i 
```

## ソースの環境変数
0.env.jsの変数を適切に変えてください。


## kintoneアプリ
/kintoneにアプリテンプレートがあります。ご利用ください。
GoogleCalendarのプロパティとkintoneアプリのフィールドのマッピングは
1.converters.jsを見てください。

# コマンドの説明
## clone
既存のAppScriptプロジェクトとリンクします。

## push
リンクされたプロジェクトからソースを同期してローカルへ上書きします。

## pull
リンクされたプロジェクトへソースをアップロードして同期します。

