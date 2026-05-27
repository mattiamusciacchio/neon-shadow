import React, { useState } from "react";
import { Play, Sparkles, Server, User, Cpu, Info } from "lucide-react";

interface LobbyScreenProps {
  onJoin: (roomId: string, playerName: string, isSingleplayer: boolean, apiKey: string) => void;
  loading: boolean;
}

export default function LobbyScreen({ onJoin, loading }: LobbyScreenProps) {
  const [roomId, setRoomId] = useState("ECLIPSE");
  const [playerName, setPlayerName] = useState(() => {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `Detective_${randomSuffix}`;
  });
  const [isSingleplayer, setIsSingleplayer] = useState(true);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim() || !roomId.trim()) return;
    onJoin(roomId.trim().toUpperCase(), playerName.trim(), isSingleplayer, apiKey.trim());
  };

  return (
    <div id="lobby-screen" className="flex flex-col items-center justify-center min-h-[500px] py-8 px-4 font-mono crt-overlay relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(168,85,247,0.06)_0%,_transparent_80%)] pointer-events-none"></div>
      
      <div className="w-full max-w-lg bg-black/80 cyber-border-purple rounded-2xl p-6 shadow-[0_0_25px_rgba(168,85,247,0.2)] relative overflow-hidden backdrop-blur-md">
        <div className="scanline"></div>
        
        {/* Neon Header Title */}
        <div className="text-center mb-8 relative z-10">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-cyan-400 font-extrabold tracking-[0.2em] uppercase animate-pulse">
            ECLIPSE_CITY_WARD_9 // LOCKDOWN_SYS
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400 font-sans leading-none neon-text-purple italic">
            NEON SHADOWS
          </h1>
          <p className="text-cyan-400 text-[10px] mt-2.5 uppercase tracking-widest font-semibold border-b border-cyan-900/45 pb-3 block">
            Investigation Protocol v4.2 // Eclipse City
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-cyan-950/10 border border-cyan-500/20 rounded-xl p-3.5 mb-6 text-xs text-cyan-300 flex items-start space-x-2.5 relative z-10 transition-colors">
          <Info className="w-5 h-5 shrink-0 text-cyan-400" />
          <div className="space-y-1">
            <span className="font-bold uppercase tracking-wider block text-[10px] text-cyan-400">SESSION DEBRIEF // CRIME SCENE:</span>
            <p className="leading-relaxed opacity-90">
              Arthur Vance è stato assassinato. Sospetti ed indizi cambiano ad ogni sessione. Parla con gli indiziati, analizza i log dei server e scopri la verità.
            </p>
          </div>
        </div>

        {/* Setup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Player Name */}
          <div className="space-y-1 relative z-10">
            <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1 mono">
              <User className="w-3.5 h-3.5" />
              <span>IL TUO CODENAME DETECTIVE</span>
            </label>
            <input
              type="text"
              required
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Inserisci nome investigatore..."
              className="w-full bg-black/80 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-slate-700 font-mono"
            />
          </div>

          {/* Mode selector tab */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-black/60 rounded-xl border border-cyan-950 relative z-10">
            <button
              type="button"
              onClick={() => setIsSingleplayer(true)}
              className={`py-3 rounded-lg text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center space-x-2 ${
                isSingleplayer 
                  ? "bg-purple-950/40 text-purple-300 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.1)]" 
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>SINGLEPLAYER (Boti)</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSingleplayer(false)}
              className={`py-3 rounded-lg text-xs font-bold font-mono tracking-wider transition-all flex items-center justify-center space-x-2 ${
                !isSingleplayer 
                  ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.1)]" 
                  : "text-slate-500 hover:text-slate-400"
              }`}
            >
              <Server className="w-4 h-4" />
              <span>MULTIPLAYER (Stanze)</span>
            </button>
          </div>

          {/* Room ID if Multiplayer */}
          {!isSingleplayer && (
            <div className="space-y-1 animate-fade-in relative z-10">
              <label className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider flex items-center space-x-1 mono">
                <Server className="w-3.5 h-3.5" />
                <span>ID STANZA CONDIVISA</span>
              </label>
              <input
                type="text"
                required
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="E.g., ECLIPSE..."
                className="w-full bg-black/80 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-slate-700 font-mono"
              />
              <span className="text-[9px] text-cyan-500/60 block leading-tight">
                Se la stanza non esiste verrà creata all'istante. Copia il codice su un'altra scheda per simulare più detective!
              </span>
            </div>
          )}

          {/* Gemini API Key Panel */}
          <div className="space-y-1 relative z-10">
            <label className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-wider flex items-center justify-between mono">
              <span className="flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CHIAVE API DI GEMINI (OPZIONALE)</span>
              </span>
              {apiKey ? (
                <span className="text-emerald-400 font-bold text-[9px] animate-pulse">ATTIVA</span>
              ) : (
                <span className="text-amber-500 font-bold text-[9px]">FALLBACK LOCAL</span>
              )}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                localStorage.setItem("gemini_api_key", e.target.value);
              }}
              placeholder="Incolla la tua chiave API di Gemini..."
              className="w-full bg-black/80 border border-fuchsia-500/30 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-fuchsia-450 focus:ring-1 focus:ring-fuchsia-450 text-slate-100 placeholder-slate-800 font-mono"
            />
            <span className="text-[9px] text-fuchsia-500/70 block leading-snug">
              Se inserisci la tua API Key, comunicherai direttamente con l'IA di Gemini realistica per gli interrogatori. Altrimenti il gioco userà risposte cyberpunk fallback simulate offline.
            </span>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl flex items-center justify-center space-x-2 font-bold uppercase font-mono tracking-widest text-sm transition-all border relative z-10 ${
              isSingleplayer
                ? "bg-[#1e1b4b]/60 hover:bg-purple-900 border-purple-500/50 text-purple-200 hover:text-white shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
                : "bg-[#082f49]/60 hover:bg-cyan-900 border-cyan-500/50 text-cyan-200 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.15)] cursor-pointer"
            } disabled:opacity-50 active:scale-[0.98] select-none`}
          >
            {loading ? (
              <span className="animate-pulse">SINCRONIZZAZIONE DI RETE...</span>
            ) : (
              <>
                <Play className="w-4.5 h-4.5" />
                <span className="neon-text-cyan">AVVIA INDAGINE</span>
              </>
            )}
          </button>

        </form>

        {/* Footer info text */}
        <div className="mt-8 pt-4 border-t border-purple-950/40 flex justify-between items-center text-[10px] text-purple-600/70">
          <span>CODENAME_SOLVER v1.02</span>
          <span>© ECLIPSE CORPORATIONS</span>
        </div>
      </div>
    </div>
  );
}
