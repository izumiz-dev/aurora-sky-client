# Gemini AIによるALTテキスト自動生成機能のセットアップ

## Cloudflare Pagesでの設定方法

### 1. Gemini API キーの取得と制限設定

1. [Google AI Studio](https://makersuite.google.com/app/apikey) にアクセス
2. Googleアカウントでログイン
3. 「Create API key」をクリック
4. 生成されたAPIキーをコピー
5. **重要：APIキーの制限を設定**
   - Google Cloud Consoleで対象のAPIキーを選択
   - 「アプリケーションの制限」→「ウェブサイト」を選択
   - 「ウェブサイトの制限」に以下を追加：
     - `https://aurora.izumiz.dev`
     - `https://aurora-sky-client.pages.dev`（Cloudflare Pagesのデフォルトドメインも追加）
     - その他使用する本番ドメイン
   - 「保存」をクリック

### 2. Cloudflare Pagesでの環境変数設定

1. [Cloudflare Dashboard](https://dash.cloudflare.com) にログイン
2. 左サイドバーから「Workers & Pages」を選択
3. 対象のPagesプロジェクトをクリック
4. 「Settings」タブをクリック
5. 「Environment variables」セクションまでスクロール
6. 「Production」の「Edit variables」をクリック
7. 「Add variable」をクリックして以下を入力：
   - **Variable name**: `VITE_GEMINI_API_KEY`
   - **Value**: 取得したGemini APIキー
   - **Type**: 「Encrypted」を選択（推奨）
8. 「Save」をクリック

### 3. デプロイ

環境変数を設定後、新しいデプロイをトリガーする必要があります：

1. GitHubにプッシュして自動デプロイを待つ
2. または、Cloudflare Pagesダッシュボードから手動でデプロイを再実行

### 4. 機能の有効化

デプロイ完了後、以下の手順で機能を有効化：

1. AuroraSkyにログイン
2. 設定画面を開く
3. 「実験的機能」セクション
4. 「Gemini APIキー」の欄が表示されることを確認
5. APIキーは環境変数から自動的に読み込まれます

### セキュリティ上の注意

- **重要**: Viteの`VITE_`プレフィックスの環境変数はビルド時にバンドルに含まれ、クライアント側で見えます
- これはGemini APIをブラウザから直接呼び出すための仕様です
- セキュリティ対策として以下を必ず実施してください：
  1. APIキーに**ウェブサイト制限**を設定（上記手順参照）
  2. 使用量のクォータ制限を設定
  3. 定期的にAPIキーの使用状況を監視
- 完全なセキュリティが必要な場合は、バックエンドプロキシの実装を検討してください

### トラブルシューティング

**ALTテキスト生成ボタンが表示されない場合：**
- ブラウザの開発者ツールでコンソールエラーを確認
- 環境変数が正しく設定されているか確認
- ページを完全にリロード（Ctrl+Shift+R）

**CSPエラーが発生する場合：**
- `_headers`ファイルにGoogle APIドメインが含まれているか確認
- Cloudflare Pagesの設定でカスタムヘッダーが上書きされていないか確認

**APIキーが不正と表示される場合：**
- Google Cloud ConsoleでAPIキーのウェブサイト制限を確認
- 現在アクセスしているドメインが許可リストに含まれているか確認