# セキュリティベストプラクティス

## セッション暗号化キーの管理

### 1. なぜランダムな文字列が必要なのか

セッション暗号化キー（`VITE_SESSION_KEY`）は、ユーザーのセッション情報を暗号化するために使用されます。この暗号化により：

- **データの保護**: セッション情報（認証トークンなど）が盗まれても、キーなしでは復号できません
- **改ざん防止**: 暗号化されたデータは改ざんが検出されます
- **XSS攻撃への対策**: JavaScriptでlocalStorageを読み取られても、暗号化されているため安全です

### 2. 暗号化の仕組み

```typescript
// 暗号化のフロー
ユーザーデータ → 暗号化キーで暗号化 → 保存
保存データ → 暗号化キーで復号 → ユーザーデータ

// キーが異なると復号できない
正しいキー → 正しくデータを復号
間違ったキー → エラーまたは意味不明なデータ
```

### 3. キーの生成方法

```bash
# スクリプトを使用
node scripts/generate-session-key.js

# または、bashコマンドで直接生成
openssl rand -base64 32

# または、Node.jsのREPLで
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 4. 環境別の設定

#### 開発環境（.env.development）
```env
# 開発環境では固定値でもOK（ただし本番とは異なる値にする）
VITE_SESSION_KEY=dev-key-not-for-production-use
```

#### 本番環境（.env.production）
```env
# 必ずランダムな値を生成して使用
VITE_SESSION_KEY=gc28lYU3k2bn3A4dMw0dEMIfovJZhwc2zxWM8cKnDiY=
```

### 5. セキュリティ上の注意点

#### やってはいけないこと ❌

1. **デフォルト値を使用する**
   ```env
   # 危険！
   VITE_SESSION_KEY=default-key
   VITE_SESSION_KEY=password123
   VITE_SESSION_KEY=aurora-sky-session-key
   ```

2. **Gitにコミットする**
   ```bash
   # .gitignoreに必ず追加
   .env
   .env.production
   .env.local
   ```

3. **短い文字列を使用する**
   ```env
   # 危険！短すぎる
   VITE_SESSION_KEY=abc123
   ```

4. **公開リポジトリに含める**
   ```typescript
   // 危険！コードに直接記述しない
   const SESSION_KEY = "my-secret-key"; // ❌
   ```

#### やるべきこと ✅

1. **十分な長さのランダム文字列を使用**
   - 最低32文字以上
   - 暗号学的に安全な乱数生成器を使用

2. **環境変数で管理**
   ```typescript
   // 正しい方法
   const SESSION_KEY = import.meta.env.VITE_SESSION_KEY;
   ```

3. **定期的な更新**
   - 3-6ヶ月ごとにキーを更新
   - 漏洩の疑いがある場合は即座に更新

4. **アクセス制限**
   - 本番環境の`.env`ファイルへのアクセスを制限
   - 必要最小限の人のみがアクセス可能に

### 6. キー更新時の手順

1. **新しいキーを生成**
   ```bash
   node scripts/generate-session-key.js
   ```

2. **段階的な移行**
   - 新旧両方のキーで復号を試みる
   - 新しいキーで暗号化
   - 一定期間後、古いキーのサポートを削除

3. **ユーザーへの影響を最小化**
   - 可能な限りユーザーの再ログインを避ける
   - 必要に応じて移行期間を設ける

### 7. まとめ

セッション暗号化キーは、アプリケーションのセキュリティの要です。適切に管理することで：

- ユーザーデータの安全性を確保
- 攻撃者からの保護
- 法規制への準拠

を実現できます。必ず本番環境では強力なランダム文字列を使用し、適切に管理してください。