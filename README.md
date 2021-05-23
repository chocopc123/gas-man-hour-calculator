# gas-man-hour-calculator
GASでNotionAPIを叩いて、工数計算をするWebアプリ  
https://script.google.com/d/1VFE3FOtPXgehGmhECufkUBlezZrsDIEW9X-t5H4JsJl__ikjprgTs7CH/edit?usp=sharing

## 環境変数(プロパティ)
- APIキー
  - API_KEY
- データベースID
  - DATABASE_ID

## 列名
- titleColumnName
  - タイトルを指定して実行するための列名
- parentTimeColumnName
  - 最新のページを取得するための日付列名
- endTimeColumnName
  - 作業終了時間(何時まで作業したか)を記録している列名
- categoryColumnName
  - 何の工数なのかを判別するための列名
