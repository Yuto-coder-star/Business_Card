# 会計探偵：まるっとケースファイル

Stylish, cinematic interactive mystery for networking events. Scan a QR code, step into Marutto Accounting Office, and help AI manager 鶴田 悠斗 uncover fictional financial inconsistencies within three minutes.

## Tech Stack

- **Next.js 14 / App Router**
- **Edge Runtime** API route powered by the OpenAI GPT-5 Turbo model
- **TypeScript**
- **Tailwind CSS v3** with glassmorphism styling
- **Framer Motion** for scene transitions and micro-interactions
- **Lucide Icons** for UI polish
- **Vercel AI SDK** for streaming completions

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Add your OpenAI API key to `.env.local`:

   ```bash
   OPENAI_API_KEY=sk-...
   ```

3. Run the development server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) and enjoy the case.

## Gameplay Flow

1. The game boots directly into Act 1 using a pre-seeded prompt.
2. GPT streams JSON-formatted scenes (title, narration, characters, evidence, prompts, styling hints).
3. The UI renders typewritten narration, animated dialogue cards, and slideable evidence decks.
4. After Act 4, the experience concludes with your detective archetype and an option to challenge another case.

## Deployment

Deploy to Vercel with the included configuration. The Edge runtime ensures instant cold starts when scanning from a physical business card QR code.
