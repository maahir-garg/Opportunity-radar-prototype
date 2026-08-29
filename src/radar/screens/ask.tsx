import { useRef, useState } from "react";
import { Info, RotateCcw, Send, Sparkles, X } from "lucide-react";
import { assistantScenarios } from "../data";
import { useNav } from "../nav";
import { useStore } from "../store";
import { OpportunityCard } from "../components";
import { Button } from "../ui";
import { ChildTopBar } from "../shell";

interface Turn {
  role: "user" | "radar";
  text: string;
  criteria?: string[];
  resultIds?: string[];
}

const STARTERS = [
  "Find a summer research opportunity in data or AI.",
  "I want a weekend sustainability challenge.",
  "Show exchange programmes I can plan for next semester.",
];

export function AskRadar() {
  const { getOpportunity } = useStore();
  const { openSheet } = useNav();
  const [log, setLog] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [removed, setRemoved] = useState<string[]>([]);
  const timer = useRef<number | null>(null);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    setInput("");
    setRemoved([]);
    setLog((l) => [...l, { role: "user", text: q }]);
    setThinking(true);

    const lower = q.toLowerCase();
    const scenario = assistantScenarios.find((s) =>
      s.matches.some((m) => lower.includes(m)),
    );

    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setThinking(false);
      if (scenario) {
        setLog((l) => [
          ...l,
          {
            role: "radar",
            text: scenario.response,
            criteria: scenario.interpretedCriteria,
            resultIds: scenario.resultOpportunityIds,
          },
        ]);
      } else {
        setLog((l) => [
          ...l,
          {
            role: "radar",
            text: "I couldn't find a current listing that meets every part. Should I relax the timing or include workshops? Try one of the starters, or search Explore directly.",
          },
        ]);
      }
    }, 550);
  }

  function reset() {
    setLog([]);
    setInput("");
    setThinking(false);
    setRemoved([]);
  }

  const lastResults = [...log].reverse().find((t) => t.resultIds)?.resultIds ?? [];
  const lastCriteria = [...log].reverse().find((t) => t.criteria)?.criteria ?? [];

  return (
    <>
      <ChildTopBar
        title="Ask Radar"
        actions={
          <button className="iconbtn" aria-label="Reset conversation" onClick={reset}>
            <RotateCcw size={20} aria-hidden />
          </button>
        }
      />
      <div className="screen stack" style={{ minHeight: "calc(100dvh - 3.5rem)" }}>
        <p className="feedback__text" style={{ textAlign: "left" }}>
          Describe the experience you want. Radar searches the same verified
          catalogue - it never invents deadlines or eligibility.
        </p>

        {log.length === 0 ? (
          <div className="stack--sm">
            <p className="overline">Try</p>
            {STARTERS.map((s) => (
              <button key={s} className="optionrow" onClick={() => send(s)}>
                <Sparkles size={18} aria-hidden color="var(--radar-color-signal)" />
                <span>{s}</span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="msglog" aria-label="Ask Radar conversation">
          {log.map((t, i) => (
            <div key={i} className={`msg msg--${t.role}`}>
              {t.text}
            </div>
          ))}
          {thinking ? (
            <div className="msg msg--radar" aria-live="polite">
              Searching the catalogue…
            </div>
          ) : null}
        </div>

        {lastCriteria.length ? (
          <div className="stack--sm">
            <p className="overline">Radar understood</p>
            <div style={{ display: "flex", gap: "var(--radar-space-2)", flexWrap: "wrap" }}>
              {lastCriteria
                .filter((c) => !removed.includes(c))
                .map((c) => (
                  <span key={c} className="chip" aria-pressed="true">
                    {c}
                    <button
                      className="iconbtn"
                      style={{ minWidth: "1.25rem", minHeight: "1.25rem", color: "inherit" }}
                      aria-label={`Remove ${c}`}
                      onClick={() => setRemoved((r) => [...r, c])}
                    >
                      <X size={14} aria-hidden />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        ) : null}

        {lastResults.length ? (
          <div className="stack">
            {lastResults.map((id) => {
              const opp = getOpportunity(id);
              return opp ? <OpportunityCard key={id} opp={opp} variant="compact" /> : null;
            })}
            <p className="deadline__abs">
              <Info size={12} aria-hidden /> Cards show structured facts and{" "}
              <button className="linkbtn" onClick={() => openSheet({ name: "howMatching" })}>
                how matching works
              </button>
              . Open any card for the official source.
            </p>
          </div>
        ) : null}

        <form
          className="composer"
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
        >
          <label className="searchfield" style={{ flex: 1 }}>
            <span className="visually-hidden">Message Ask Radar</span>
            <textarea
              className="input"
              rows={1}
              placeholder="Describe what you're looking for…"
              style={{ paddingLeft: "var(--radar-space-3)", paddingRight: "var(--radar-space-3)" }}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
            />
          </label>
          <Button type="submit" aria-label="Send" icon={<Send size={18} aria-hidden />} disabled={!input.trim()}>
            <span className="visually-hidden">Send</span>
          </Button>
        </form>
      </div>
    </>
  );
}
