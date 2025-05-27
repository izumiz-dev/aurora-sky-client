# デプロイメントガイド

## 環境変数の設定

本番環境では以下の環境変数を設定してください：

### 必須の環境変数

1. **`VITE_SESSION_KEY`** - セッション暗号化キー
   - 32文字以上のランダムな文字列
   - 生成方法: `openssl rand -base64 32`
   - **重要**: この値は秘密にし、Gitにコミットしないでください

### Vercelでの設定方法

1. Vercelのダッシュボードにアクセス
2. プロジェクトの Settings → Environment Variables
3. 以下を追加:
   ```
   Name: VITE_SESSION_KEY
   Value: [生成した32文字以上のキー]
   Environment: Production
   ```

### Netlifyでの設定方法

1. Netlifyのダッシュボードにアクセス
2. Site settings → Environment variables
3. 以下を追加:
   ```
   Key: VITE_SESSION_KEY
   Value: [生成した32文字以上のキー]
   ```

### Cloudflare Pagesでの設定方法

1. Cloudflareダッシュボードにアクセス
2. Workers & Pages → 対象のプロジェクト → Settings → Environment variables
3. 以下を追加:
   ```
   Variable name: VITE_SESSION_KEY
   Value: [生成した32文字以上のキー]
   ```

## セキュリティに関する注意事項

- 本番環境では必ずHTTPSを使用してください
- 環境変数は適切に管理し、公開リポジトリにコミットしないでください
- セッションキーは定期的に更新することを推奨します

## トラブルシューティング

### ログインが保持されない場合

1. ブラウザコンソールで `window.debugStorage()` を実行
2. エラーメッセージを確認
3. 特に以下を確認:
   - `[Crypto] WARNING: Session encryption key not configured` が表示されていないか
   - LocalStorageやSessionStorageにデータが保存されているか

### 暗号化エラーが発生する場合

- HTTPS環境であることを確認
- `VITE_SESSION_KEY` が正しく設定されているか確認
- ブラウザがWeb Crypto APIをサポートしているか確認