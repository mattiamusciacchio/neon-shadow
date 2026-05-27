import { useState, useEffect } from "react";
import { Terminal, Shield, Zap, RefreshCw, X, CheckCircle } from "lucide-react";

interface CyberTerminalProps {
  taskName: string;
  onComplete: () => void;
  onClose: () => void;
}

export default function CyberTerminal({ taskName, onComplete, onClose }: CyberTerminalProps) {
  const [minigameType, setMinigameType] = useState<"DECRYPT" | "WIRES" | "STABILIZE">("DECRYPT");
  const [solved, setSolved] = useState(false);

  // Decrypt Game State
  const [targetSequence, setTargetSequence] = useState<string[]>([]);
  const [currentSequence, setCurrentSequence] = useState<string[]>([]);
  const HEX_POOL = ["4F", "E3", "7A", "9C", "2B", "A1", "FD", "0E"];

  // Wires Game State
  const [wires, setWires] = useState<{ id: number; color: string; left: string; right: string; connected: boolean }[]>([
    { id: 1, color: "border-purple-500 text-purple-400", left: "PORT-A", right: "RELAY-B", connected: false },
    { id: 2, color: "border-cyan-500 text-cyan-400", left: "PORT-B", right: "RELAY-D", connected: false },
    { id: 3, color: "border-rose-500 text-rose-400", left: "PORT-C", right: "RELAY-A", connected: false },
    { id: 4, color: "border-yellow-500 text-yellow-400", left: "PORT-D", right: "RELAY-C", connected: false }
  ]);
  const [activeWire, setActiveWire] = useState<number | null>(null);

  // Stabilize Game State
  const [frequency, setFrequency] = useState(50);
  const [targetFrequency, setTargetFrequency] = useState(72);

  // Initialize randomly
  useEffect(() => {
    // Pick minigame based on task string
    if (taskName.toLowerCase().includes("firewall") || taskName.toLowerCase().includes("decrypt")) {
      setMinigameType("DECRYPT");
      const target = Array.from({ length: 4 }, () => HEX_POOL[Math.floor(Math.random() * HEX_POOL.length)]);
      setTargetSequence(target);
    } else if (taskName.toLowerCase().includes("cavi") || taskName.toLowerCase().includes("wire") || taskName.toLowerCase().includes("relè")) {
      setMinigameType("WIRES");
    } else {
      setMinigameType("STABILIZE");
      setTargetFrequency(30 + Math.floor(Math.random() * 50));
    }
  }, [taskName]);

  // Decrypt Logix
  const handleHexClick = (hex: string) => {
    if (solved) return;
    const nextSeq = [...currentSequence, hex];
    setCurrentSequence(nextSeq);

    // Validate matches expected part sequence
    const isCorrectSoFar = nextSeq.every((val, idx) => val === targetSequence[idx]);
    if (!isCorrectSoFar) {
      setCurrentSequence([]); // restart
      return;
    }

    if (nextSeq.length === targetSequence.length) {
      setSolved(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  // Wire Connection Logic
  const handleWireConnect = (id: number) => {
    if (solved) return;
    setWires(prev => 
      prev.map(w => w.id === id ? { ...w, connected: true } : w)
    );
  };

  useEffect(() => {
    if (minigameType === "WIRES") {
      const allConnected = wires.every(w => w.connected);
      if (allConnected && !solved) {
        setSolved(true);
        setTimeout(() => {
          onComplete();
        }, 1200);
      }
    }
  }, [wires, minigameType]);

  // Frequency Stabilizer Logic
  const handleFreqChange = (val: number) => {
    if (solved) return;
    setFrequency(val);
    if (Math.abs(val - targetFrequency) <= 1) {
      setSolved(true);
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  };

  return (
    <div id="cyber-terminal-modal" className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-50 p-4 font-mono">
      <div className="w-full max-w-lg bg-[#050505]/95 cyber-border-cyan rounded-xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.25)] crt-overlay relative p-6">
        <div className="scanline"></div>
        
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-4 relative z-10">
          <div className="flex items-center space-x-2 text-cyan-400">
            <Terminal className="w-5 h-5" />
            <span className="font-bold uppercase tracking-wider text-sm">{taskName || "TERMINALE DI RETE"}</span>
          </div>
          <button 
            onClick={onClose}
            className="text-cyan-500/60 hover:text-cyan-400 p-1 rounded hover:bg-cyan-500/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console info screen */}
        <div className="bg-black/60 border border-cyan-500/20 rounded p-4 mb-4 text-xs text-cyan-200 relative z-10">
          <p className="text-cyan-400 font-semibold mb-1 col-span-2">ECLIPSE_SECURE_OS v9.42 // STATUS: LOCKDOWN_ACTIVE</p>
          <p className="opacity-80">Compila il bypass sub-neurale per reinstallare il circuito di protocollo.</p>
        </div>

        {/* Solution success UI */}
        {solved ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 relative z-10">
            <CheckCircle className="w-16 h-16 text-emerald-400 animate-pulse" />
            <h3 className="text-xl font-bold text-emerald-300 uppercase tracking-widest leading-none">BYPASS COMPLETATO</h3>
            <p className="text-xs text-emerald-500/80">Canale dati sincronizzato. Aggiornando il registro centrale...</p>
          </div>
        ) : (
          <div className="min-h-[220px] flex flex-col justify-center relative z-10">
            
            {/* Decrypt Sequence Puzzle */}
            {minigameType === "DECRYPT" && (
              <div className="space-y-6">
                <div className="text-center">
                  <span className="text-xs uppercase text-cyan-500/60 block mb-2 font-semibold">SEQUENZA DA DECIFRARE:</span>
                  <div className="flex justify-center space-x-2">
                    {targetSequence.map((seq, idx) => (
                      <span 
                        key={idx} 
                        className={`w-12 py-2 bg-cyan-950/30 border rounded text-center text-sm font-bold tracking-widest ${
                          idx < currentSequence.length ? "border-emerald-500 text-emerald-400" : "border-cyan-500/40 text-cyan-500/40"
                        }`}
                      >
                        {seq}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {HEX_POOL.map((hex, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleHexClick(hex)}
                      className="bg-cyan-950/20 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 py-3 rounded text-sm font-bold tracking-wider hover:border-cyan-400 active:scale-95 transition-all"
                    >
                      {hex}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Wires Connection Puzzle */}
            {minigameType === "WIRES" && (
              <div className="space-y-4">
                <p className="text-center text-xs text-yellow-400/80 mb-2">Sincronizza i nodi energetici di accoppiamento</p>
                <div className="space-y-3">
                  {wires.map(wire => (
                    <div key={wire.id} className="flex items-center justify-between bg-black/40 p-2 rounded border border-cyan-950">
                      <span className={`text-xs px-2 py-1 bg-black/60 border rounded ${wire.color} text-center font-bold tracking-wider w-24`}>
                        {wire.left}
                      </span>
                      
                      <div className="flex-1 px-4 flex items-center justify-center">
                        {wire.connected ? (
                          <div className="h-0.5 bg-cyan-500 flex-1 relative">
                            <Zap className="w-4 h-4 text-cyan-400 absolute -top-1.5 left-1/2 -translate-x-1/2 animate-bounce" />
                          </div>
                        ) : (
                          <button
                            onClick={() => handleWireConnect(wire.id)}
                            className="bg-[#120524] hover:bg-cyan-500/20 border border-cyan-500/30 text-[10px] text-cyan-400 px-3 py-1 rounded-full hover:border-cyan-400 transition-colors flex items-center space-x-1 animate-pulse"
                          >
                            <RefreshCw className="w-3 h-3 text-cyan-400" />
                            <span>COLLEGA</span>
                          </button>
                        )}
                      </div>

                      <span className="text-xs font-semibold text-cyan-500/60 border border-cyan-500/20 px-2 py-1 rounded w-24 text-center">
                        {wire.right}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stabilize Frequency Puzzle */}
            {minigameType === "STABILIZE" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center text-center">
                  <div className="bg-black/40 border border-cyan-500/20 p-2 rounded flex-1 mr-2">
                    <span className="text-[10px] block text-cyan-500/60 uppercase">FREQ. ATTUALE</span>
                    <span className="text-2xl font-bold text-cyan-300 animate-pulse">{frequency}.0 GHz</span>
                  </div>
                  <div className="bg-black/40 border border-purple-500/20 p-2 rounded flex-1 ml-2">
                    <span className="text-[10px] block text-purple-500/60 uppercase">RIFERIMENTO</span>
                    <span className="text-2xl font-bold text-purple-400">{targetFrequency}.0 GHz</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-cyan-500">
                    <span>30 GHz</span>
                    <span>100 GHz</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="100"
                    value={frequency}
                    onChange={(e) => handleFreqChange(parseInt(e.target.value))}
                    className="w-full accent-cyan-400 bg-cyan-950/40 h-2 rounded cursor-pointer"
                  />
                </div>

                <div className="text-center text-xs text-cyan-400/70 p-2 border border-dashed border-cyan-500/20 bg-cyan-500/5 animate-pulse rounded">
                  Regola il reattore fino a allineare le frequenze energetiche. Margine: +/-1 GHz
                </div>
              </div>
            )}

          </div>
        )}

        {/* Bottom design elements */}
        <div className="mt-6 pt-3 border-t border-cyan-500/10 flex justify-between text-[10px] text-cyan-600">
          <span>SEC_SYS_BYPASS_ENG</span>
          <span>ECLIPSE_CELL_19_LOG</span>
        </div>
      </div>
    </div>
  );
}
