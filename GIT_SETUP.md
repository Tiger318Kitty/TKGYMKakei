# GitHubへのプッシュ方法（HTTPS版）

## エラーの原因
SSH接続を使おうとしていますが、SSH鍵が設定されていません。

## 解決方法：HTTPSを使用

### 1. 現在のリモートURLを確認
```bash
git remote -v
```

### 2. HTTPSに変更
```bash
# 既存のリモートを削除
git remote remove origin

# HTTPSでリモートを追加（URLを自分のものに置き換え）
git remote add origin https://github.com/あなたのユーザー名/kakeibo-app.git
```

### 3. プッシュ
```bash
git push -u origin main
```

初回はGitHubのユーザー名とパスワード（またはPersonal Access Token）を求められます。

## Personal Access Token（PAT）の作成方法

GitHubはパスワード認証を廃止したため、トークンが必要です。

### 手順
1. GitHubにログイン
2. 右上のアイコン → Settings
3. 左メニュー最下部 → Developer settings
4. Personal access tokens → Tokens (classic)
5. Generate new token → Generate new token (classic)
6. Note: `kakeibo-app` など任意の名前
7. Expiration: 90 days（または任意）
8. Select scopes: `repo` にチェック
9. Generate token をクリック
10. **表示されたトークンをコピー（再表示できないので注意）**

### トークンを使ってプッシュ
```bash
git push -u origin main
```

- Username: GitHubのユーザー名
- Password: コピーしたトークン（パスワードではない）

## 別の方法：GitHub Desktop を使う

GUIで簡単に操作できます。

### 手順
1. GitHub Desktop をダウンロード: https://desktop.github.com/
2. インストールしてGitHubアカウントでログイン
3. File → Add Local Repository
4. `kakeibo-app` フォルダを選択
5. Publish repository をクリック

これで自動的にプッシュされます。

## SSH鍵を設定する方法（上級者向け）

HTTPSで問題なければ、この方法は不要です。

### SSH鍵の生成
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Enterを3回押す（パスフレーズなし）

### 公開鍵をGitHubに登録
```bash
# 公開鍵を表示
cat ~/.ssh/id_ed25519.pub
```

表示された内容をコピーして：
1. GitHub → Settings → SSH and GPG keys
2. New SSH key
3. Title: 任意の名前
4. Key: コピーした公開鍵を貼り付け
5. Add SSH key

### 接続テスト
```bash
ssh -T git@github.com
```

"Hi username!" と表示されればOK

## おすすめの方法

初心者の方には以下をおすすめします：
1. **GitHub Desktop**（最も簡単）
2. **HTTPS + Personal Access Token**（コマンドライン派）
3. SSH鍵設定（上級者向け）
