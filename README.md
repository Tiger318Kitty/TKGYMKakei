# 家計簿アプリ

React + Vite + PWAで作成したシンプルな家計簿管理アプリです。

## 機能

- 収入・支出の記録
- カテゴリ別管理
- 月次集計表示
- ローカルストレージでデータ保存
- PWA対応（スマホにインストール可能）
- オフライン動作

## 開発環境のセットアップ

### 必要なもの
- Node.js 18以上

### インストール

```bash
npm install
```

### 開発サーバー起動

```bash
npm run dev
```

ブラウザで http://localhost:5173 を開きます。

### ビルド

```bash
npm run build
```

ビルドされたファイルは `dist` フォルダに出力されます。

## デプロイ方法

### Vercelへのデプロイ

1. GitHubにコードをプッシュ
2. Vercelアカウントでログイン
3. 「New Project」からリポジトリを選択
4. 自動的にビルド・デプロイされます

### Netlifyへのデプロイ

1. GitHubにコードをプッシュ
2. Netlifyアカウントでログイン
3. 「Add new site」→「Import an existing project」
4. リポジトリを選択
5. Build command: `npm run build`
6. Publish directory: `dist`

## スマホへのインストール方法

### iOS (Safari)
1. デプロイしたURLにアクセス
2. 共有ボタンをタップ
3. 「ホーム画面に追加」を選択

### Android (Chrome)
1. デプロイしたURLにアクセス
2. メニュー（3点）をタップ
3. 「ホーム画面に追加」を選択

## PWAアイコンについて

`public/pwa-192x192.png` と `public/pwa-512x512.png` に
アプリアイコン画像を配置してください。

オンラインツールで簡単に作成できます：
- https://www.pwabuilder.com/imageGenerator
- https://realfavicongenerator.net/

## データについて

データはブラウザのローカルストレージに保存されます。
ブラウザのデータを削除すると、記録も削除されるのでご注意ください。
