import React, { useState } from "react";
import { RefreshCw, Check } from "lucide-react";

function makeChallenge() {
  const a = Math.floor(Math.random() * 12) + 1;
  const b = Math.floor(Math.random() * 12) + 1;
  const op = Math.random() < 0.5 ? "+" : "−";
  const answer = op === "+" ? a + b : a - b;
  return { a, b, op, answer };
}

export default function MathCaptcha({ onVerify }) {
  const [challenge, setChallenge] = useState(makeChallenge);
  const [value, setValue] = useState("");

  const handleChange = (e) => {
    const v = e.target.value;
    setValue(v);
    const ok = v.trim() !== "" && Number(v) === challenge.answer;
    onVerify?.(ok);
  };

  const refresh = () => {
    setChallenge(makeChallenge());
    setValue("");
    onVerify?.(false);
  };

  const solved = value.trim() !== "" && Number(value) === challenge.answer;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
        solved ? "border-emerald-400 bg-emerald-50" : "border-[#c9ccd1] bg-white"
      }`}
    >
      <div className="flex-1 flex items-center gap-2">
        <span className="text-[14px] text-[#212326] font-medium whitespace-nowrap">
          What is {challenge.a} {challenge.op} {challenge.b}?
        </span>
        <input
          inputMode="numeric"
          pattern="[0-9-]*"
          value={value}
          onChange={handleChange}
          placeholder="Answer"
          aria-label="Captcha answer"
          className="w-20 h-8 rounded-md border border-[#c9ccd1] px-2 text-[14px] text-[#212326] focus:outline-none focus:border-[#006fbb] focus:ring-1 focus:ring-[#006fbb]"
        />
      </div>
      {solved ? (
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 text-white shrink-0">
          <Check className="w-4 h-4" />
        </span>
      ) : (
        <button
          type="button"
          onClick={refresh}
          aria-label="New challenge"
          className="inline-flex items-center justify-center w-9 h-9 rounded-md text-[#6d7175] hover:bg-[#f6f6f7] shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}