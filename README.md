# 会計探偵：まるっとケースファイル

"会計探偵：まるっとケースファイル" は、名刺のQRコードからすぐに遊べる3分間のシネマティック会計ミステリーです。プレイヤーはMarutto会計事務所の臨時調査員として、AIマネージャーの鶴田 悠斗と共に数字に潜む違和感を暴き出します。OpenAI GPT-5とVercel AI SDKを活用して、毎回異なるインタラクティブなシナリオが生成されます。

## 主な機能

- 🎬 **シネマティックUI**：ガラスモーフィズムとFramer Motionによる滑らかなトランジション。
- 🧠 **AI駆動の物語生成**：Edge Runtime APIでGPT-5をストリーミングし、JSONシーンをリアルタイムに描画。
- 📇 **Evidenceカードビュー**：証拠をカードスライダーで表示。直感的に違和感を発見。
- 🧩 **推理ガイド**：タイプライター演出のナレーションと会話、クイック返信ボタン、タイプ判定フィナーレ。

## 技術スタック

- [Next.js 15](https://nextjs.org/)（App Router, Edge Runtime）
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide React](https://lucide.dev/)
- [OpenAI GPT-5 API](https://platform.openai.com/) via [Vercel AI SDK](https://sdk.vercel.ai/)

## セットアップ

1. 依存関係をインストールします。
   ```bash
   npm install
   ```
2. OpenAI APIキーを設定します。
   ```bash
   cp .env.example .env.local # 例（ファイルを用意する場合）
   ```
   `.env.local` に `OPENAI_API_KEY=sk-...` を設定してください。
3. 開発サーバーを起動します。
   ```bash
   npm run dev
   ```
   http://localhost:3000 を開いて体験できます。

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | Next.js 開発サーバーを起動します。 |
| `npm run build` | 本番ビルドを生成します。 |
| `npm start` | 本番ビルドを起動します。 |
| `npm run lint` | ESLint を実行し、品質チェックを行います。 |

## デプロイ

本プロジェクトはVercelでのデプロイを想定しています。Edge RuntimeでOpenAIストリーミングを行うため、Vercelの環境変数に `OPENAI_API_KEY` を設定してください。

### Vercelで404が表示される場合のチェックリスト

ローカルの開発サーバー(`npm run dev`)および本番ビルド(`npm run build` → `npm run start`)では、トップページに正常にアクセスできることを確認しています。そのため、Vercelで404が表示される場合は、以下の設定を見直してください。

1. **プロジェクトのルートディレクトリ**  
   Gitリポジトリ直下に本アプリがある場合は、Vercelの Project Settings → General → *Root Directory* を `Business_Card` に設定してください（初期値のままの場合、アプリのあるディレクトリを見失い404になります）。
2. **Build & Output Settings**  
   Frameworkは *Next.js*、Build Commandは `npm run build`、Output Directoryは `.next` を指定します。変更した場合は保存して再デプロイしてください。
3. **環境変数**  
   `OPENAI_API_KEY` を *Environment Variables* に登録し、Production環境に反映されているか確認します。未設定でもトップページ自体は表示されますが、API呼び出しが失敗して画面が固まる原因となります。

設定を更新したら、Vercelのダッシュボードから再デプロイを実行すると、トップページが正しく表示されるようになります。

## ライセンス

このリポジトリはプロジェクト要件に合わせて構築されたサンプルであり、特定のライセンスは付与していません。ご自身の利用規約に沿ってご利用ください。
