import React, { useState, useRef, useEffect } from "react";
import { Suspect, DialogueMessage } from "../types";
import { Send, Terminal, Loader2, Sparkles, AlertCircle, Volume2 } from "lucide-react";

interface InterrogationModalProps {
  suspect: Suspect;
  chatHistory: DialogueMessage[];
  onSendMessage: (suspectId: string, messageText: string) => Promise<void>;
  onClose: () => void;
  loading: boolean;
}

export default function InterrogationModal({ suspect, chatHistory, onSendMessage, onClose, loading }: InterrogationModalProps) {
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Suggested dialogue options based on Cyberpunk Noir trope
  const SUGGESTED_QUESTIONS = [
    `Cosa stavi facendo ieri sera alle ore 02:40?`,
    `Quali erano i tuoi reali rapporti con Arthur Vance?`,
    `Cosa sai riguardo la chiave d'accesso duplicata?`,
    `Dimmi la verità sul tuo segreto privato!`
  ];

  // Auto scroll down chats
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(suspect.id, inputText.trim());
    setInputText("");
  };

  const handleSuggestClick = (question: string) => {
    if (loading) return;
    onSendMessage(suspect.id, question);
  };
  return (
    <div id="interrogation-modal" className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-50 p-4 font-mono">
      <div className="w-full max-w-3xl bg-[#050505]/95 cyber-border-cyan rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(6,182,212,0.3)] flex flex-col h-[580px] crt-overlay relative">
        <div className="scanline"></div>
        
        {/* Top Header Panel */}
        <div className="flex items-center justify-between bg-black border-b border-cyan-500/25 px-6 py-4 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <span 
                className="absolute -top-1 -left-1 w-3 h-3 rounded-full animate-ping" 
                style={{ backgroundColor: suspect.color }} 
              />
              <span 
                className="absolute -top-1 -left-1 w-3 h-3 rounded-full" 
                style={{ backgroundColor: suspect.color }} 
              />
              <div className="w-10 h-10 rounded-lg bg-black/60 border border-cyan-500/30 flex items-center justify-center font-bold text-sm text-slate-100 uppercase tracking-widest leading-none">
                {suspect.name.substring(0, 2)}
              </div>
            </div>
            
            <div>
              <h2 className="text-sm font-extrabold text-slate-100 uppercase tracking-widest leading-none flex items-center space-x-2">
                <span>{suspect.name}</span>
                <span className="text-[10px] text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded uppercase font-medium">#{suspect.codename}</span>
              </h2>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider mt-1 block uppercase">{suspect.role}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-200 text-xs font-bold border border-cyan-500/30 px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:border-cyan-450 transition-all uppercase cursor-pointer"
          >
            Sospendi Interrogatorio
          </button>
        </div>

        {/* Dashboard Info Grid */}
        <div className="grid grid-cols-3 bg-black border-b border-cyan-500/15 text-center text-[10px] py-2.5 flex-shrink-0 relative z-10">
          <div className="border-r border-cyan-500/10">
            <span className="text-slate-400 block font-semibold mb-0.5">ONESTÀ RILEVATA</span>
            <span className={`font-extrabold font-mono ${suspect.honesty > 60 ? "text-cyan-400" : "text-yellow-500"}`}>{suspect.honesty}% // MATCH</span>
          </div>
          <div className="border-r border-cyan-500/10">
            <span className="text-slate-400 block font-semibold mb-0.5">STRESS LIVELLO</span>
            <span className={`font-extrabold font-mono ${suspect.stress > 60 ? "text-red-400 animate-pulse" : "text-cyan-400"}`}>{suspect.stress}% // PULSE</span>
          </div>
          <div>
            <span className="text-slate-400 block font-semibold mb-0.5">SINTONIA NEURALE</span>
            <span className="font-extrabold font-mono text-purple-400">{suspect.fear}% // FEAR</span>
          </div>
        </div>

        {/* Interactive Chat Board */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#05030e]/40 scrollbar-thin">
          <div className="bg-[#100727]/30 border border-cyan-500/10 rounded-xl p-3 text-cyan-400 text-[11px] leading-relaxed flex items-start space-x-2">
            <Volume2 className="w-5 h-5 shrink-0 text-cyan-400" />
            <span>
              <strong>Rilevatore Vocale Attivo:</strong> formula qualsiasi domanda digitandola ad ambiente libero o usa i suggerimenti registrati per rilevare contraddizioni o discrepanze biografiche.
            </span>
          </div>

          {chatHistory.map((msg, index) => (
            <div 
              key={index} 
              className={`flex flex-col max-w-[80%] ${msg.isAi ? "mr-auto items-start" : "ml-auto items-end"}`}
            >
              <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                {msg.sender} // {msg.timestamp}
              </span>
              
              <div 
                className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                  msg.isAi 
                    ? `bg-[#0d071b] ${suspect.stress > 65 ? "border-rose-500/40 text-rose-300" : "border-cyan-500/20 text-slate-100"}` 
                    : "bg-cyan-950/30 border-cyan-500/40 text-cyan-300"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-cyan-500/70 p-2 pl-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-[10px] uppercase tracking-widest font-bold font-mono animate-pulse">Sintetizzando risposta neurale...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Questions Drawer */}
        <div className="bg-[#05020c] px-6 py-2 border-t border-cyan-500/10 flex-shrink-0">
          <div className="flex items-center space-x-1.5 text-[9px] font-bold text-cyan-500/60 uppercase mb-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Domande Suggerite dall'Archivio</span>
          </div>
          <div className="flex space-x-2 overflow-x-auto py-1 pr-1 scrollbar-none">
            {SUGGESTED_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                disabled={loading}
                onClick={() => handleSuggestClick(q)}
                className="bg-cyan-950/20 text-cyan-400 text-[10px] px-3 py-1.5 rounded-full border border-cyan-500/20 hover:border-cyan-400/60 hover:bg-cyan-950/40 shrink-0 select-none transition-all active:scale-95 disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Message Input Bar */}
        <form 
          onSubmit={handleSubmit}
          className="border-t border-cyan-500/20 p-4 bg-[#0c0721]/90 flex items-center space-x-3"
        >
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl flex-1 flex items-center px-3.5 py-1 focus-within:border-cyan-400 hover:border-cyan-500/60 transition-colors">
            <span className="text-cyan-500/60 font-bold text-xs font-mono mr-2">&gt;</span>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Fai una domanda libera, es. 'Dove nascondi le prove?'..."
              disabled={loading}
              className="bg-transparent border-0 outline-0 focus:ring-0 text-slate-100 text-xs w-full py-2 placeholder-cyan-500/40 font-mono focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim() || loading}
            className="bg-cyan-600 hover:bg-cyan-500 border border-cyan-400/80 text-white rounded-xl px-4 py-2.5 flex items-center justify-center font-bold tracking-wider hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] disabled:opacity-35 disabled:hover:shadow-none disabled:cursor-not-allowed transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
}
