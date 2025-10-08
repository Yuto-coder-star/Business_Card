"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Wand2,
} from "lucide-react";

interface CharacterLine {
  name: string;
  role?: string;
  dialogue: string;
}

interface EvidenceCard {
  title: string;
  content: string;
}

interface SceneStyle {
  bg?: string;
  accent?: string;
}

interface Scene {
  scene_title: string;
  narration?: string;
  characters?: CharacterLine[];
  evidence_cards?: EvidenceCard[];
  player_prompt?: string;
  ui_hint?: string;
  style?: SceneStyle;
  options?: string[];
  detective_type?: string;
  closing_line?: string;
  insight?: string;
  [key: string]: unknown;
}

const DEFAULT_BACKGROUND =
  "linear-gradient(135deg, #050b14 0%, #0b1622 45%, #162635 100%)";
const DEFAULT_ACCENT = "#46E1C2";
const TOTAL_ACTS = 4;

function getActNumber(scene?: Scene | null) {
  if (!scene) return undefined;
  const match = scene.scene_title?.match(/Act\s*(\d+)/i);
  if (!match) return undefined;
  const num = Number.parseInt(match[1] ?? "", 10);
  return Number.isNaN(num) ? undefined : num;
}

function extractScene(content: string): Scene | null {
  if (!content) return null;
  const trimmed = content.trim();
  if (!trimmed) return null;

  const tryParse = (input: string) => {
    try {
      return JSON.parse(input) as Scene;
    } catch {
      return null;
    }
  };

  let parsed = tryParse(trimmed);
  if (parsed) return parsed;

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    parsed = tryParse(trimmed.slice(firstBrace, lastBrace + 1));
  }

  return parsed;
}

function Typewriter({ text, speed = 28 }: { text?: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      return;
    }

    setDisplayed("");
    let frame = 0;
    const characters = Array.from(text);

    const id = window.setInterval(() => {
      frame += 1;
      setDisplayed((prev) => prev + (characters[frame - 1] ?? ""));
      if (frame >= characters.length) {
        window.clearInterval(id);
      }
    }, speed);

    return () => window.clearInterval(id);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

function CharacterList({
  characters,
  accent,
}: {
  characters?: CharacterLine[];
  accent: string;
}) {
  if (!characters?.length) return null;

  return (
    <div className="space-y-3">
      <div className="text-[10px] uppercase tracking-[0.4em] text-white/50">
        Voices in the Room
      </div>
      <div className="grid gap-3">
        {characters.map((character) => (
          <motion.div
            key={`${character.name}-${character.dialogue}`}
            className="glass-panel rounded-2xl px-4 py-3"
            style={{ borderColor: `${accent}33` }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between text-sm text-white/80">
              <span className="font-semibold" style={{ color: accent }}>
                {character.name}
              </span>
              {character.role && (
                <span className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                  {character.role}
                </span>
              )}
            </div>
            <p className="mt-1 text-sm leading-relaxed text-white/90">
              {character.dialogue}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EvidenceCarousel({
  evidence,
  accent,
}: {
  evidence?: EvidenceCard[];
  accent: string;
}) {
  if (!evidence?.length) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-[0.4em] text-white/50">
          Evidence Cards
        </div>
        <Wand2 className="h-3.5 w-3.5 text-white/60" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {evidence.map((card) => (
          <motion.div
            key={card.title}
            className="min-w-[230px] max-w-[260px] rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl shadow-glow-teal"
            whileHover={{ y: -6 }}
            transition={{ type: "spring", stiffness: 220, damping: 20 }}
            style={{ borderColor: `${accent}33`, boxShadow: `0 16px 40px ${accent}26` }}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-white/60">
              {card.title}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/90 whitespace-pre-line">
              {card.content}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneView({
  scene,
  raw,
  accent,
  isStreaming,
}: {
  scene: Scene | null;
  raw: string;
  accent: string;
  isStreaming: boolean;
}) {
  if (!scene) {
    return (
      <div className="glass-panel rounded-3xl p-6">
        <div className="flex items-center gap-3 text-sm text-white/70">
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: accent }} />
          <span>鶴田 悠斗がケースファイルを解析中...</span>
        </div>
        {raw && (
          <p className="mt-3 text-xs text-white/40">
            {isStreaming ? "データを受信しています..." : raw}
          </p>
        )}
      </div>
    );
  }

  const accentStyle = { color: accent };
  const actNumber = getActNumber(scene);

  return (
    <motion.div
      key={`${scene.scene_title}-${scene.narration?.length ?? 0}`}
      className="glass-panel space-y-6 rounded-3xl p-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ borderColor: `${accent}33`, boxShadow: `0 20px 60px ${accent}25` }}
    >
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/50">
          {actNumber ? `Act ${actNumber}` : "Scene"}
          <span className="h-[1px] flex-1 bg-white/10" />
        </div>
        <h2 className="text-xl font-semibold text-white" style={accentStyle}>
          {scene.scene_title}
        </h2>
      </div>

      {scene.narration && (
        <p className="text-base leading-relaxed text-white/90">
          <Typewriter text={scene.narration} speed={22} />
        </p>
      )}

      <CharacterList characters={scene.characters} accent={accent} />

      <EvidenceCarousel evidence={scene.evidence_cards} accent={accent} />

      {scene.player_prompt && (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4" style={{ borderColor: `${accent}44` }}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
            Your Move
          </p>
          <p className="mt-2 text-sm text-white/80">{scene.player_prompt}</p>
          {scene.ui_hint && (
            <p className="mt-3 text-xs text-white/45">{scene.ui_hint}</p>
          )}
        </div>
      )}

      {scene.insight && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4" style={{ borderColor: `${accent}33` }}>
          <p className="text-[11px] uppercase tracking-[0.3em] text-white/50">
            Insight
          </p>
          <p className="mt-2 text-sm text-white/90">{scene.insight}</p>
        </div>
      )}
    </motion.div>
  );
}

function EndingOverlay({
  scene,
  accent,
  onRestart,
}: {
  scene: Scene | null;
  accent: string;
  onRestart: () => void;
}) {
  if (!scene) return null;

  const detectiveTypeRaw = scene.detective_type ?? scene["Your Detective Type"];
  const closingLineRaw = scene.closing_line ?? scene["closing_line"] ?? scene["closing remark"];
  const optionalInsightRaw = scene.insight ?? scene["insight"] ?? scene["lesson"];
  const detectiveType = typeof detectiveTypeRaw === "string" ? detectiveTypeRaw : undefined;
  const closingLine = typeof closingLineRaw === "string" ? closingLineRaw : undefined;
  const optionalInsight = typeof optionalInsightRaw === "string" ? optionalInsightRaw : undefined;

  return (
    <motion.div
      key={scene.scene_title}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-black/70 p-8 text-white shadow-2xl"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 18 }}
        style={{ borderColor: `${accent}55`, boxShadow: `0 25px 80px ${accent}35` }}
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(70,225,194,0.25),_transparent_65%)]" />
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.35em] text-white/60">
          Case Closed
          <Sparkles className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <h3 className="mt-4 text-2xl font-semibold" style={{ color: accent }}>
          {detectiveType ? `あなたの探偵タイプ：${detectiveType}` : "CASE COMPLETE"}
        </h3>
        {optionalInsight && (
          <p className="mt-3 text-sm leading-relaxed text-white/80">{optionalInsight}</p>
        )}
        {closingLine && (
          <p className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/90" style={{ borderColor: `${accent}33` }}>
            {closingLine}
          </p>
        )}
        <button
          type="button"
          onClick={onRestart}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/10 p-3 text-sm font-semibold text-white transition hover:bg-white/15"
          style={{ color: accent }}
        >
          <RefreshCw className="h-4 w-4" />
          ▶ Challenge Another Case
        </button>
      </motion.div>
    </motion.div>
  );
}

export default function Home() {
  const { messages, status, sendMessage, setMessages } = useChat();
  const [inputValue, setInputValue] = useState("");
  const isLoading = status === "submitted" || status === "streaming";
  const [hasStarted, setHasStarted] = useState(false);
  const [endingScene, setEndingScene] = useState<Scene | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasStarted) {
      setHasStarted(true);
      sendMessage({ text: "鶴田さん、新しいケースを共有してください。" });
    }
  }, [sendMessage, hasStarted]);

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const parsedScenes = useMemo(() =>
    messages
      .filter((message) => message.role === "assistant")
      .map((message) => extractScene(message.content))
      .filter((scene): scene is Scene => Boolean(scene)),
  [messages]);

  const latestScene = parsedScenes[parsedScenes.length - 1];
  const accent = latestScene?.style?.accent ?? DEFAULT_ACCENT;
  const background = latestScene?.style?.bg ?? DEFAULT_BACKGROUND;

  const actNumbers = parsedScenes
    .map((scene) => getActNumber(scene))
    .filter((value): value is number => typeof value === "number");
  const highestAct = actNumbers.length ? Math.max(...actNumbers) : undefined;
  const latestAct = getActNumber(latestScene) ?? highestAct;
  const progressAct = latestAct ?? (messages.some((msg) => msg.role === "assistant") ? 1 : 0);
  const progressPercent = progressAct
    ? Math.min((Math.min(progressAct, TOTAL_ACTS) / TOTAL_ACTS) * 100, 100)
    : isLoading
    ? 8
    : 0;
  const latestAssistantId = useMemo(() => {
    const lastAssistant = [...messages].reverse().find((msg) => msg.role === "assistant");
    return lastAssistant?.id ?? null;
  }, [messages]);

  useEffect(() => {
    const lastMessage = [...messages].reverse().find((msg) => msg.role === "assistant");
    if (!lastMessage) return;
    const scene = extractScene(lastMessage.content);
    if (!scene) return;

    const hasEnding =
      Boolean(scene.detective_type) ||
      /Your Detective Type/i.test(scene.scene_title ?? "") ||
      /Challenge Another Case/.test(scene.player_prompt ?? "") ||
      /Act\s*4/i.test(scene.scene_title ?? "");

    if (hasEnding) {
      setEndingScene(scene);
    }
  }, [messages]);

  const quickOptions = Array.isArray(latestScene?.options)
    ? (latestScene?.options as string[])
    : [];

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    await sendMessage({ text: trimmed });
    setInputValue("");
  };

  const handleOptionSelect = (option: string) => {
    if (isLoading) return;
    setInputValue("");
    void sendMessage({ text: option });
  };

  const handleRestart = () => {
    setEndingScene(null);
    setMessages([]);
    setInputValue("");
    setHasStarted(false);
  };

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 text-white"
      style={{ background }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(70,225,194,0.2),transparent_60%)]" />
      <div className="relative z-10 flex w-full max-w-4xl flex-col gap-6">
        <motion.header
          className="glass-panel rounded-3xl border-white/10 p-6 shadow-glow-teal"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ borderColor: `${accent}33` }}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm uppercase tracking-[0.35em] text-white/60">
                <Sparkles className="h-4 w-4" style={{ color: accent }} />
                Marutto Case Interface
              </div>
              <h1 className="mt-3 text-3xl font-semibold text-white" style={{ color: accent }}>
                会計探偵：まるっとケースファイル
              </h1>
              <p className="mt-2 text-sm text-white/70">
                鶴田 悠斗とともに、数字に隠れた違和感を暴き出す3分間のシネマティック体験。
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right text-xs text-white/60">
              <span className="uppercase tracking-[0.35em]">Progress</span>
              <div className="flex items-center gap-2">
                <span>
                  Act {progressAct > 0 ? Math.min(progressAct, TOTAL_ACTS) : 1} / {TOTAL_ACTS}
                </span>
                <div className="h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    className="h-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.6 }}
                    style={{ background: accent }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        <div
          ref={scrollRef}
          className="glass-panel h-[60vh] overflow-y-auto rounded-3xl border-white/10 p-6"
          style={{ borderColor: `${accent}33` }}
        >
          <div className="flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => {
                const isUser = message.role === "user";
                const scene = !isUser ? extractScene(message.content) : null;
                const isLatestAssistant =
                  !isUser &&
                  (latestAssistantId
                    ? message.id === latestAssistantId
                    : index === messages.length - 1);

                return (
                  <motion.div
                    key={message.id ?? `${message.role}-${index}`}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    className={isUser ? "flex justify-end" : "flex justify-start"}
                  >
                    {isUser ? (
                      <div className="max-w-[80%] rounded-2xl bg-white/15 px-4 py-3 text-sm text-white">
                        {message.content}
                      </div>
                    ) : (
                      <SceneView
                        scene={scene}
                        raw={message.content}
                        accent={accent}
                        isStreaming={isLoading && isLatestAssistant}
                      />
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {messages.length === 0 && (
              <div className="text-center text-sm text-white/60">
                ケースファイルを読み込んでいます…
              </div>
            )}
          </div>
        </div>

        {quickOptions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quickOptions.map((option) => (
              <motion.button
                key={option}
                type="button"
                onClick={() => handleOptionSelect(option)}
                disabled={isLoading}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                whileTap={{ scale: 0.98 }}
                style={{ borderColor: `${accent}33`, color: accent }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="glass-panel flex items-center gap-3 rounded-3xl border-white/10 p-3"
          style={{ borderColor: `${accent}33` }}
        >
          <input
            value={inputValue}
            onChange={(event: ChangeEvent<HTMLInputElement>) => setInputValue(event.target.value)}
            placeholder="あなたの推理や質問を入力…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: accent }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
      </div>

      <AnimatePresence>
        {endingScene && (
          <EndingOverlay scene={endingScene} accent={accent} onRestart={handleRestart} />
        )}
      </AnimatePresence>
    </div>
  );
}
