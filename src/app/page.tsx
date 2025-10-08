"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, RefreshCw, Send, Sparkles } from "lucide-react";

type Character = {
  name: string;
  role?: string;
  dialogue: string;
};

type EvidenceCard = {
  title: string;
  content: string;
};

type SceneStyle = {
  bg?: string;
  accent?: string;
};

type ScenePayload = {
  scene_title: string;
  narration: string;
  characters?: Character[];
  evidence_cards?: EvidenceCard[];
  player_prompt?: string;
  ui_hint?: string;
  style?: SceneStyle;
  detective_type?: string;
  closing_line?: string;
};

type HistoryMessage = {
  role: "user" | "assistant";
  content: string;
};

type UserMessage = {
  id: string;
  role: "user";
  content: string;
};

type AssistantMessage = {
  id: string;
  role: "assistant";
  content: ScenePayload | null;
  raw: string;
  isLoading?: boolean;
  error?: string;
};

type Message = UserMessage | AssistantMessage;

const DEFAULT_BG = "linear-gradient(to bottom right, #0B1622, #162635)";
const DEFAULT_ACCENT = "#46E1C2";

function TypewriterText({
  text,
  speed = 25,
  className,
}: {
  text: string;
  speed?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    setDisplay("");
    if (!text) return;
    let index = 0;
    const timer = window.setInterval(() => {
      setDisplay((prev) => prev + text.charAt(index));
      index += 1;
      if (index >= text.length) {
        window.clearInterval(timer);
      }
    }, speed);
    return () => window.clearInterval(timer);
  }, [text, speed]);

  return <span className={className}>{display}</span>;
}

function EvidenceCarousel({
  cards,
  accent,
}: {
  cards: EvidenceCard[];
  accent: string;
}) {
  if (!cards?.length) return null;
  return (
    <div className="space-y-3">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
        Evidence Board
      </p>
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory">
        {cards.map((card, idx) => (
          <motion.div
            key={`${card.title}-${idx}`}
            className="min-w-[240px] max-w-[260px] rounded-2xl bg-white/10 backdrop-blur-lg border border-white/15 shadow-lg snap-start"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, type: "spring", stiffness: 120 }}
          >
            <div className="p-4 space-y-2">
              <p className="text-xs font-semibold tracking-wide text-white/70">
                {card.title}
              </p>
              <p className="text-sm leading-relaxed text-white/90 whitespace-pre-line">
                {card.content}
              </p>
            </div>
            <div
              className="h-1 rounded-b-2xl"
              style={{ background: accent }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SceneCard({
  scene,
  accent,
  messageId,
}: {
  scene: ScenePayload;
  accent: string;
  messageId: string;
}) {
  const accentBorder =
    accent && !/^linear|^radial|^conic/i.test(accent.trim())
      ? accent.trim()
      : undefined;

  return (
    <motion.div
      className="w-full rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)] p-6 space-y-6"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
      style={accentBorder ? { borderColor: accentBorder } : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-white/40">
            {scene.scene_title}
          </p>
          <div
            className="mt-2 h-1 w-16 rounded-full"
            style={{ background: accent }}
          />
          <TypewriterText
            key={`${messageId}-${scene.scene_title}`}
            text={scene.narration}
            className="mt-2 block text-base leading-relaxed text-white/90"
          />
        </div>
        <Sparkles className="h-5 w-5 text-white/40" />
      </div>

      {scene.characters?.length ? (
        <div className="space-y-3">
          {scene.characters.map((character, index) => (
            <motion.div
              key={`${character.name}-${index}`}
              className="rounded-2xl border border-white/10 bg-white/8 px-4 py-3"
              initial={{ opacity: 0, x: index % 2 === 0 ? -16 : 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, type: "spring", stiffness: 160 }}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                {character.role}
              </p>
              <p className="text-sm font-semibold text-white">
                {character.name}
              </p>
              <p className="text-sm text-white/90 leading-relaxed mt-1 whitespace-pre-line">
                {character.dialogue}
              </p>
            </motion.div>
          ))}
        </div>
      ) : null}

      <EvidenceCarousel cards={scene.evidence_cards ?? []} accent={accent} />

      {(scene.player_prompt || scene.ui_hint) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 space-y-2">
          {scene.player_prompt ? (
            <p className="text-sm font-semibold" style={{ color: accent }}>
              {scene.player_prompt}
            </p>
          ) : null}
          {scene.ui_hint ? (
            <p className="text-xs uppercase tracking-[0.3em] text-white/40">
              {scene.ui_hint}
            </p>
          ) : null}
        </div>
      )}
    </motion.div>
  );
}

function LoadingScene() {
  return (
    <motion.div
      className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-6"
      initial={{ opacity: 0.4 }}
      animate={{ opacity: [0.4, 1, 0.4] }}
      transition={{ repeat: Infinity, duration: 1.6 }}
    >
      <div className="flex items-center gap-3 text-white/70">
        <Loader2 className="h-4 w-4 animate-spin" />
        <p className="text-sm tracking-widest uppercase">Decrypting next scene...</p>
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [history, setHistory] = useState<HistoryMessage[]>([]);
  const historyRef = useRef<HistoryMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bootstrapped = useRef(false);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const scrollToBottom = useCallback(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const callAI = useCallback(
    async (payload: HistoryMessage[]) => {
      setIsLoading(true);
      const assistantId = crypto.randomUUID();

      setHistory(payload);
      historyRef.current = payload;

      setMessages((prev) => [
        ...prev,
        {
          id: assistantId,
          role: "assistant",
          content: null,
          raw: "",
          isLoading: true,
        },
      ]);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages: payload }),
        });

        if (!res.ok) {
          throw new Error("サーバーから有効な応答を取得できませんでした。");
        }

        if (!res.body) {
          throw new Error("応答を受信できませんでした。");
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let streamedText = "";
        let parsedScene: ScenePayload | null = null;

        const processSegment = (segment: string) => {
          if (!segment) return;
          const trimmed = segment.trim();
          if (!trimmed.startsWith("data:")) return;
          const data = trimmed.replace(/^data:\s*/, "");
          if (data === "[DONE]") return;

          streamedText += data;

          setMessages((prev) =>
            prev.map((message) => {
              if (message.role === "assistant" && message.id === assistantId) {
                return {
                  ...message,
                  raw: streamedText,
                } satisfies AssistantMessage;
              }
              return message;
            })
          );

          try {
            parsedScene = JSON.parse(streamedText) as ScenePayload;
            setMessages((prev) =>
              prev.map((message) => {
                if (message.role === "assistant" && message.id === assistantId) {
                  return {
                    ...message,
                    content: parsedScene,
                    isLoading: false,
                  } satisfies AssistantMessage;
                }
                return message;
              })
            );
          } catch {
            // Wait for more chunks
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const segments = buffer.split("\n\n");
          buffer = segments.pop() ?? "";
          segments.forEach(processSegment);
        }

        processSegment(buffer);

        if (!parsedScene) {
          throw new Error("シーンの解析に失敗しました。");
        }

        setMessages((prev) =>
          prev.map((message) => {
            if (message.role === "assistant" && message.id === assistantId) {
              return {
                ...message,
                content: parsedScene,
                isLoading: false,
              } satisfies AssistantMessage;
            }
            return message;
          })
        );

        const finalHistory: HistoryMessage[] = [
          ...payload,
          { role: "assistant", content: streamedText },
        ];
        setHistory(finalHistory);
        historyRef.current = finalHistory;
      } catch (error) {
        console.error(error);
        setMessages((prev) =>
          prev.map((message) => {
            if (message.role === "assistant" && message.id === assistantId) {
              return {
                ...message,
                isLoading: false,
                error:
                  error instanceof Error
                    ? error.message
                    : "不明なエラーが発生しました。",
              } satisfies AssistantMessage;
            }
            return message;
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const startGame = useCallback(async () => {
    setMessages([]);
    setHistory([]);
    historyRef.current = [];
    const initialPrompt =
      "プレイヤーが到着しました。イントロダクションから物語を始め、Act 1を提示してください。";
    const initialMessages: HistoryMessage[] = [
      { role: "user", content: initialPrompt },
    ];
    await callAI(initialMessages);
  }, [callAI]);

  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;
    startGame();
  }, [startGame]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;
    const trimmed = input.trim();
    const userMessage: UserMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    const payload: HistoryMessage[] = [
      ...historyRef.current,
      { role: "user", content: trimmed },
    ];
    await callAI(payload);
  }, [input, isLoading, callAI]);

  const handleReset = useCallback(async () => {
    if (isLoading) return;
    await startGame();
  }, [startGame, isLoading]);

  const latestAssistant = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role === "assistant" && message.content) {
        return { id: message.id, scene: message.content };
      }
    }
    return null;
  }, [messages]);

  const accentColor = latestAssistant?.scene.style?.accent ?? DEFAULT_ACCENT;
  const backgroundGradient = latestAssistant?.scene.style?.bg ?? DEFAULT_BG;

  const finaleScene = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      const message = messages[i];
      if (message.role === "assistant" && message.content) {
        if (message.content.detective_type && message.content.closing_line) {
          return message.content;
        }
      }
    }
    return null;
  }, [messages]);

  return (
    <main
      className="relative min-h-screen w-full overflow-hidden text-white"
      style={{ background: backgroundGradient }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.6),transparent,rgba(0,0,0,0.7))]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 px-4 pb-10 pt-12 sm:px-8 lg:px-12">
        <motion.header
          className="flex flex-col gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-3 text-sm uppercase tracking-[0.4em] text-white/50">
            <Sparkles className="h-4 w-4" />
            <span>Marutto Accounting Office Case Files</span>
          </div>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl lg:text-5xl">
            会計探偵：まるっとケースファイル
          </h1>
          <p className="max-w-2xl text-sm text-white/70 sm:text-base">
            鶴田 悠斗とともに、わずか数分で数字の影に潜む謎を追う。
            シネマティックな短編推理で、直感と洞察を試してみましょう。
          </p>
        </motion.header>

        <div
          ref={scrollRef}
          className="flex-1 space-y-4 overflow-y-auto rounded-[32px] border border-white/10 bg-white/5 p-5 shadow-[0_0_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
        >
          {messages.map((message) => {
            if (message.role === "user") {
              return (
                <motion.div
                  key={message.id}
                  className="ml-auto max-w-[80%] rounded-3xl border border-white/20 bg-white/15 px-4 py-3 text-right text-sm text-white/90 shadow-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.content}
                </motion.div>
              );
            }

            if (message.error) {
              return (
                <motion.div
                  key={message.id}
                  className="w-full rounded-3xl border border-red-400/40 bg-red-500/20 px-4 py-4 text-sm text-red-100"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {message.error}
                </motion.div>
              );
            }

            if (message.isLoading || !message.content) {
              return <LoadingScene key={message.id} />;
            }

            return (
              <SceneCard
                key={message.id}
                scene={message.content}
                accent={message.content.style?.accent ?? accentColor}
                messageId={message.id}
              />
            );
          })}
        </div>

        <motion.div
          className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:flex-row sm:items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex w-full flex-1 items-center gap-3 rounded-2xl bg-black/20 px-4 py-3">
            <input
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
              placeholder="あなたの推理や質問を書き込んでください..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  handleSend();
                }
              }}
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw className="h-4 w-4" />
              リスタート
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold uppercase tracking-[0.3em] transition hover:brightness-110 disabled:cursor-not-allowed"
              style={{
                background: accentColor,
                color: "#041218",
                opacity: !input.trim() || isLoading ? 0.6 : 1,
              }}
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {finaleScene ? (
          <motion.div
            key="finale"
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-[90%] max-w-xl space-y-4 rounded-3xl border border-white/20 bg-white/10 p-8 text-center text-white shadow-[0_25px_80px_rgba(0,0,0,0.5)]"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">
                Mission Report
              </p>
              <h2
                className="text-3xl font-semibold"
                style={{ color: finaleScene?.style?.accent ?? accentColor }}
              >
                Your Detective Type: {finaleScene.detective_type}
              </h2>
              <p className="text-sm leading-relaxed text-white/80">
                {finaleScene.closing_line}
              </p>
              <button
                onClick={handleReset}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.35em] text-black transition hover:bg-white/80"
              >
                ▶ Challenge Another Case
              </button>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
