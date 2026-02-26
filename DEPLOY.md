# Vercelへのデプロイ手順

## 前提条件
- GitHubアカウント
- Vercelアカウント（GitHubでサインアップ可能）

## 手順

### 1. GitHubリポジトリの作成

#### 1-1. GitHubにログイン
https://github.com にアクセスしてログイン

#### 1-2. 新しいリポジトリを作成
1. 右上の「+」→「New repository」をクリック
2. Repository name: `kakeibo-app`（任意の名前）
3. Public または Private を選択
4. 「Create repository」をクリック

#### 1-3. ローカルでGit初期化とプッシュ

コマンドプロンプトまたはPowerShellで以下を実行：

```bash
# kakeibo-appフォルダに移動
cd kakeibo-app

# Gitリポジトリを初期化
git init

# すべてのファイルを追加
git add .

# 最初のコミット
git commit -m "Initial commit: 家計簿アプリ"

# GitHubリポジトリと接続（URLは自分のリポジトリに置き換え）
git remote add origin https://github.com/あなたのユーザー名/kakeibo-app.git

# mainブランチに変更
git branch -M main

# GitHubにプッシュ
git push -u origin main
```

**注意：** GitHubのユーザー名とリポジトリURLは自分のものに置き換えてください。

### 2. Vercelでデプロイ

#### 2-1. Vercelにサインアップ/ログイン
1. https://vercel.com にアクセス
2. 「Sign Up」をクリック
3. 「Continue with GitHub」を選択
4. GitHubアカウントで認証

#### 2-2. プロジェクトをインポート
1. Vercelダッシュボードで「Add New...」→「Project」をクリック
2. 「Import Git Repository」セクションで `kakeibo-app` を探す
3. 「Import」をクリック

#### 2-3. プロジェクト設定
以下の設定が自動的に検出されます：
- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

**そのまま「Deploy」をクリック**

#### 2-4. デプロイ完了
- 数分でデプロイが完了します
- 完了すると、URLが表示されます（例：`https://kakeibo-app-xxx.vercel.app`）
- このURLをスマホでアクセスすれば、アプリが使えます

### 3. スマホにインストール

#### iOS (Safari)
1. デプロイされたURLにアクセス
2. 画面下部の「共有」ボタン（四角に上矢印）をタップ
3. 「ホーム画面に追加」を選択
4. 「追加」をタップ

#### Android (Chrome)
1. デプロイされたURLにアクセス
2. 画面右上のメニュー（3点）をタップ
3. 「ホーム画面に追加」または「アプリをインストール」を選択
4. 「追加」をタップ

### 4. 更新方法

コードを変更した後、GitHubにプッシュすると自動的に再デプロイされます：

```bash
git add .
git commit -m "更新内容の説明"
git push
```

Vercelが自動的に検知して、新しいバージョンをデプロイします。

## トラブルシューティング

### ビルドエラーが発生する場合
1. ローカルで `npm run build` を実行してエラーを確認
2. エラーを修正してから再度プッシュ

### デプロイ後に画面が真っ白
1. ブラウザのコンソールでエラーを確認
2. Vercelのダッシュボードで「Deployments」→「View Function Logs」を確認

### アイコンが表示されない
1. `public/pwa-192x192.png` と `public/pwa-512x512.png` が存在するか確認
2. ファイル名が正確か確認
3. 再度プッシュしてデプロイ

## 参考リンク
- Vercel公式ドキュメント: https://vercel.com/docs
- Vite公式ドキュメント: https://vitejs.dev/
