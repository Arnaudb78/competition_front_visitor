"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getChallenge,
  completeChallenge,
  getMyProfile,
  type Challenge,
  type ChallengeQuestionItem,
} from "@/lib/challenges";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Participant {
  name: string;
  age: number;
}

type Phase = "intro" | "question" | "score_board" | "completed";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getQuestion(
  participant: Participant,
  pair: { childQuestion: ChallengeQuestionItem | null; adultQuestion: ChallengeQuestionItem | null }
): ChallengeQuestionItem | null {
  return participant.age <= 12 ? pair.childQuestion : pair.adultQuestion;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChallengePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myFirstName, setMyFirstName] = useState<string>("Moi");

  const [phase, setPhase] = useState<Phase>("intro");

  // Question state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  // Scores: player name → points accumulated this challenge
  const [localScores, setLocalScores] = useState<Record<string, number>>({});

  // Score board state
  const [barsVisible, setBarsVisible] = useState(false);

  // Stable ref for use inside setTimeout callbacks
  const stateRef = useRef({
    currentQuestionIndex,
    currentPlayerIndex,
    participants,
    challenge,
    localScores,
  });
  useEffect(() => {
    stateRef.current = {
      currentQuestionIndex,
      currentPlayerIndex,
      participants,
      challenge,
      localScores,
    };
  });

  // ─── Load data ──────────────────────────────────────────────────────────────

  useEffect(() => {
    Promise.all([getChallenge(id), getMyProfile()]).then(([ch, profile]) => {
      setChallenge(ch);
      const name = profile?.firstName ?? "Joueur";
      const age = profile?.age ?? 18;
      setMyFirstName(name);
      const parts: Participant[] = [{ name, age }];
      setParticipants(parts);
      setLocalScores({ [name]: 0 });
      setLoading(false);
    });
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Score board auto-advance ────────────────────────────────────────────────

  useEffect(() => {
    if (phase !== "score_board") return;
    const t1 = setTimeout(() => setBarsVisible(true), 80);
    const t2 = setTimeout(() => {
      postCompleteAndFinish();
    }, 3500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Flow helpers ────────────────────────────────────────────────────────────

  function postCompleteAndFinish() {
    const { localScores: s, participants: parts } = stateRef.current;
    // Sum all scores or use the first participant's score as "my" score
    const totalScore = Object.values(s).reduce((a, b) => a + b, 0);
    completeChallenge(id, totalScore); // fire & forget
    setPhase("completed");
  }

  /**
   * Called after a player has answered (or skipped).
   * Advances to the next player, or to the next question, or to score_board.
   */
  function advanceAfterAnswer() {
    const {
      currentQuestionIndex: qIdx,
      currentPlayerIndex: pIdx,
      participants: parts,
      challenge: ch,
    } = stateRef.current;

    if (!ch) return;

    const nextPlayerIdx = pIdx + 1;

    if (nextPlayerIdx < parts.length) {
      // More players on this question (shouldn't happen in solo mode)
      setCurrentPlayerIndex(nextPlayerIdx);
      setSelectedAnswer(null);
      setAnswerRevealed(false);
    } else {
      // Last player on this question — go to next question
      const nextQuestionIdx = qIdx + 1;
      if (nextQuestionIdx < ch.questions.length) {
        setCurrentQuestionIndex(nextQuestionIdx);
        setCurrentPlayerIndex(0);
        setSelectedAnswer(null);
        setAnswerRevealed(false);
      } else {
        // All questions done
        setBarsVisible(false);
        setPhase("score_board");
      }
    }
  }

  function handleAnswerSelect(index: number) {
    if (answerRevealed || !challenge) return;
    const { currentPlayerIndex: pIdx, currentQuestionIndex: qIdx } =
      stateRef.current;
    const player = participants[pIdx];
    const pair = challenge.questions[qIdx];
    if (!pair) return;
    const question = getQuestion(player, pair);
    if (!question) {
      // No question for this player — skip them
      advanceAfterAnswer();
      return;
    }

    setSelectedAnswer(index);
    setAnswerRevealed(true);

    if (question.answers[index]?.isCorrect) {
      setLocalScores((prev) => ({
        ...prev,
        [player.name]: (prev[player.name] || 0) + 100,
      }));
    }

    setTimeout(() => {
      advanceAfterAnswer();
    }, 1200);
  }

  function handleSkip() {
    advanceAfterAnswer();
  }

  function handleScoreBoardTap() {
    if (phase !== "score_board") return;
    postCompleteAndFinish();
  }

  // ─── Loading / error ─────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-dvh bg-[#0d0b1e]">
        <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="flex flex-col items-center justify-center min-h-dvh gap-4 px-6 bg-[#0d0b1e]">
        <p className="text-white/60 text-sm">Challenge introuvable</p>
        <button
          onClick={() => router.push("/jeu/challenges")}
          className="text-purple-400 text-sm"
        >
          ← Retour
        </button>
      </div>
    );
  }

  // ─── INTRO ───────────────────────────────────────────────────────────────────

  if (phase === "intro") {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-black">
        {/* Background image */}
        {challenge.imageUrl ? (
          <img
            src={challenge.imageUrl}
            alt={challenge.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, #4f0b8c 0%, #8b2fc9 50%, #c947e8 100%)",
            }}
          />
        )}

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Back button */}
        <button
          onClick={() => router.push("/jeu/challenges")}
          className="absolute top-12 left-5 z-20 w-10 h-10 rounded-full bg-black/30 flex items-center justify-center active:scale-90 transition-transform"
        >
          <ChevronLeft className="w-6 h-6 text-white" />
        </button>

        {/* Bottom overlay */}
        <div className="absolute bottom-0 inset-x-0 z-10 px-6 pb-10 pt-24 bg-gradient-to-t from-black/90 via-black/50 to-transparent">
          <p className="text-white/60 text-sm font-medium mb-1">
            {challenge.questions.length} question
            {challenge.questions.length !== 1 ? "s" : ""}
          </p>
          <h1 className="text-white text-2xl font-bold mb-2 leading-tight">
            {challenge.name}
          </h1>
          {challenge.description && (
            <p className="text-white/70 text-sm leading-relaxed mb-6">
              {challenge.description}
            </p>
          )}
          <button
            onClick={() => {
              if (participants.length > 0) {
                setPhase("question");
              }
            }}
            className="w-full py-4 rounded-full font-semibold text-base text-black active:scale-95 transition-all"
            style={{ background: "#FFCA44" }}
          >
            Démarrer le challenge
          </button>
        </div>
      </div>
    );
  }

  // ─── QUESTIONS ───────────────────────────────────────────────────────────────

  if (phase === "question") {
    const player = participants[currentPlayerIndex];
    const pair = challenge.questions[currentQuestionIndex];
    const question = player && pair ? getQuestion(player, pair) : null;

    // If this player has no question for this pair, skip automatically
    if (player && pair && !question) {
      setTimeout(() => advanceAfterAnswer(), 0);
      return (
        <div className="flex items-center justify-center min-h-dvh bg-[#0d0b1e]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      );
    }

    if (!player) {
      return (
        <div className="flex items-center justify-center min-h-dvh bg-[#0d0b1e]">
          <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>
      );
    }

    return (
      <div className="relative flex flex-col min-h-dvh bg-[#0d0b1e] animate-fade-in-up">
        {/* Back */}
        <button
          onClick={() => router.push("/jeu/challenges")}
          className="absolute top-10 left-5 z-10 text-white/70 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="px-5 pt-10 pb-4 text-center">
          <p className="text-white/40 text-xs font-medium tracking-wider uppercase">
            Question {currentQuestionIndex + 1}/{challenge.questions.length}
          </p>
        </div>

        {/* Content */}
        {question ? (
          <div className="flex-1 px-5 flex flex-col gap-5 pb-10 overflow-y-auto">
            <div>
              <h2 className="text-2xl font-bold text-white leading-tight">
                {question.text}
              </h2>
              <p className="text-white/50 text-sm mt-3">
                Choisissez une seule réponse
              </p>
            </div>

            {/* 2×2 answer grid */}
            <div className="grid grid-cols-2 gap-3">
              {question.answers.map((answer, i) => {
                let cls =
                  "py-6 px-4 rounded-2xl border-2 text-sm text-center transition-all active:scale-95 disabled:cursor-default leading-snug flex items-center justify-center min-h-[100px] font-medium";
                if (answerRevealed) {
                  if (answer.isCorrect) {
                    cls += " bg-[#3d1d6e] border-[#9b59d0] text-white font-bold";
                  } else if (selectedAnswer === i) {
                    cls +=
                      " bg-[#1a1a3e]/60 border-[#3b3b8a]/50 text-white/30";
                  } else {
                    cls +=
                      " bg-[#1a1a3e]/30 border-[#3b3b8a]/30 text-white/20";
                  }
                } else {
                  cls += " bg-[#1a1a3e] border-[#3b3b8a] text-white";
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswerSelect(i)}
                    disabled={answerRevealed}
                    className={cls}
                  >
                    {answer.text}
                  </button>
                );
              })}
            </div>

            {/* Skip */}
            {!answerRevealed && (
              <button
                onClick={handleSkip}
                className="text-white/40 text-sm text-left mt-1"
              >
                Je ne souhaite pas répondre
              </button>
            )}
          </div>
        ) : (
          // No question (shouldn't reach here normally, but just in case)
          <div className="flex-1 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}

      </div>
    );
  }

  // ─── SCORE BOARD ─────────────────────────────────────────────────────────────

  if (phase === "score_board") {
    const scoreValues = participants.map((p) => localScores[p.name] || 0);
    const maxScore = Math.max(...scoreValues, 1);
    const leaderScore = Math.max(...scoreValues);
    const barCount = participants.length;
    const barMaxW =
      barCount === 1
        ? 80
        : barCount <= 3
        ? 72
        : barCount <= 5
        ? 60
        : barCount <= 7
        ? 48
        : 38;

    const isCurrentUserLeader = (() => {
      // The current authenticated user's score — we use the first participant whose
      // name matches myFirstName, or just the leader check
      const myScore = localScores[myFirstName] ?? localScores[participants[0]?.name] ?? 0;
      return myScore > 0 && myScore === leaderScore;
    })();

    return (
      <button
        onClick={handleScoreBoardTap}
        className="relative h-dvh w-full overflow-hidden flex flex-col animate-fade-in-up text-left"
        style={{
          background:
            "radial-gradient(ellipse at bottom center, #3b0764 0%, #0d0b1e 65%)",
        }}
      >
        {/* Header */}
        <div className="flex-shrink-0 px-6 pt-14 pb-4 text-center pointer-events-none">
          <p className="text-white/50 text-xs uppercase tracking-widest mb-1">
            {challenge.name}
          </p>
          <h2 className="text-2xl font-bold text-white">
            {isCurrentUserLeader ? "Bien joué, tu es en tête !" : "Bien joué !"}
          </h2>
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end justify-center gap-3 px-4 pb-14 pointer-events-none">
          {participants.map((p, i) => {
            const score = localScores[p.name] || 0;
            const isLeader = score > 0 && score === leaderScore;
            const targetH =
              maxScore > 0
                ? Math.max((score / maxScore) * 52, score > 0 ? 8 : 2)
                : 2;

            return (
              <div
                key={p.name}
                className="flex flex-col items-center"
                style={{ width: barMaxW, maxWidth: barMaxW, flexShrink: 0 }}
              >
                {/* Score */}
                <p
                  className="text-xs font-bold mb-1 transition-opacity duration-500"
                  style={{
                    color: isLeader ? "#f5c842" : "rgba(255,255,255,0.6)",
                    opacity: barsVisible ? 1 : 0,
                  }}
                >
                  {score} pts
                </p>

                {/* Avatar */}
                <div
                  className="rounded-full overflow-hidden border-2 mb-0 transition-all duration-500 flex-shrink-0"
                  style={{
                    width: isLeader ? 48 : 38,
                    height: isLeader ? 48 : 38,
                    borderColor: isLeader ? "#f5c842" : "rgba(255,255,255,0.3)",
                    opacity: barsVisible ? 1 : 0,
                    transform: barsVisible ? "scale(1)" : "scale(0.5)",
                  }}
                >
                  <img
                    src="/avatar.png"
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Animated bar */}
                <div
                  className="w-full rounded-t-xl flex-shrink-0"
                  style={{
                    height: barsVisible ? `${targetH}vh` : "0px",
                    transition: `height ${0.7 + i * 0.08}s cubic-bezier(0.34, 1.56, 0.64, 1)`,
                    background: isLeader
                      ? "linear-gradient(to top, #c97c00, #f5c842)"
                      : "linear-gradient(to top, rgba(255,255,255,0.12), rgba(255,255,255,0.28))",
                  }}
                />

                {/* Name */}
                <p
                  className="text-white/50 text-xs mt-1 truncate w-full text-center transition-opacity duration-500"
                  style={{ opacity: barsVisible ? 1 : 0 }}
                >
                  {p.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Hint */}
        <p className="absolute bottom-4 inset-x-0 text-center text-white/25 text-xs pointer-events-none">
          Appuyer pour terminer
        </p>
      </button>
    );
  }

  // ─── COMPLETED ───────────────────────────────────────────────────────────────

  const totalScore = Object.values(localScores).reduce((a, b) => a + b, 0);

  return (
    <div className="relative h-dvh overflow-hidden bg-[#0d0b1e] flex flex-col animate-fade-in-up">
      {/* Top content */}
      <div className="flex-shrink-0 px-6 pt-16 text-center">
        {participants.length > 0 && (
          <div className="flex justify-center -space-x-3 mb-5">
            {participants.map((p, i) => (
              <div
                key={i}
                className="w-12 h-12 rounded-full border-2 border-[#0d0b1e] flex items-center justify-center text-white font-bold text-sm"
                style={{
                  background: i % 2 === 0 ? "#7c3aed" : "#2563eb",
                }}
              >
                {p.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}

        <h2 className="text-3xl font-bold text-white">Challenge terminé !</h2>
        <p className="text-white/60 text-base mt-2">
          Score total :{" "}
          <span className="text-[#FFCA44] font-bold">{totalScore} pts</span>
        </p>
      </div>

      {/* Challenge image fills remaining space */}
      {challenge.imageUrl && (
        <div className="flex-1 relative min-h-0 mt-8">
          <img
            src={challenge.imageUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-contain object-bottom opacity-30"
          />
        </div>
      )}

      {/* CTA pinned at bottom */}
      <div className="absolute bottom-0 inset-x-0 px-6 pb-10">
        <button
          onClick={() => router.push("/jeu/challenges")}
          className="w-full py-4 rounded-full font-semibold text-base text-black active:scale-95 transition-all"
          style={{ background: "#FFCA44" }}
        >
          Retour aux challenges
        </button>
      </div>
    </div>
  );
}
