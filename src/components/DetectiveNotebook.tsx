import { useState } from "react";
import { Suspect, Clue, TermLog } from "../types";
import { Users, FileSearch, HardDrive, Skull, Eye, Heart, HelpCircle, CheckCircle, AlertTriangle } from "lucide-react";

interface DetectiveNotebookProps {
  suspects: Suspect[];
  clues: Clue[];
  termLogs: TermLog[];
  onClose: () => void;
  onAccuse: (suspectId: string) => void;
  killerNPCId?: string; // debug indicator if necessary
}

export default function DetectiveNotebook({ suspects, clues, termLogs, onClose, onAccuse, killerNPCId }: DetectiveNotebookProps) {
  const [activeTab, setActiveTab] = useState<"PROFILES" | "CLUES" | "LOGS" | "ACCUSE">("PROFILES");
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [suspectStatuses, setSuspectStatuses] = useState<{ [id: string]: "NONE" | "SUSPECT" | "INNOCENT" }>({});

  const toggleSuspectStatus = (id: string, s: "SUSPECT" | "INNOCENT") => {
    setSuspectStatuses(prev => ({
      ...prev,
      [id]: prev[id] === s ? "NONE" : s
    }));
  };

  const selectedSuspect = suspects.find(s => s.id === selectedSuspectId) || suspects[0];

  return (
    <div id="detective-notebook-modal" className="fixed inset-0 flex items-center justify-center bg-black/85 backdrop-blur-md z-50 p-4 font-sans">
      <div className="w-full max-w-4xl bg-[#050505]/95 cyber-border-purple rounded-xl overflow-hidden shadow-[0_0_30px_rgba(168,85,247,0.25)] flex flex-col md:flex-row h-[550px]">
        
        {/* Sidebar Navigation */}
        <div className="w-full md:w-56 bg-black border-b md:border-b-0 md:border-r border-purple-500/20 p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 text-purple-400 mb-6">
              <Skull className="w-6 h-6 animate-pulse" />
              <div className="leading-none">
                <span className="font-bold text-[9px] uppercase tracking-widest block font-mono">CASE FILE // ACCATAS</span>
                <span className="text-xl font-extrabold uppercase font-mono tracking-tight neon-text-purple">ECLIPSE_97</span>
              </div>
            </div>

            <nav className="space-y-1 font-mono">
              <button
                onClick={() => setActiveTab("PROFILES")}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "PROFILES" 
                    ? "bg-purple-950/40 text-purple-300 border border-purple-500/30" 
                    : "text-purple-400/50 hover:text-purple-300 hover:bg-purple-950/10"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Suspect Profiles</span>
              </button>

              <button
                onClick={() => setActiveTab("CLUES")}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "CLUES" 
                    ? "bg-purple-950/40 text-purple-300 border border-purple-500/30" 
                    : "text-purple-400/50 hover:text-purple-300 hover:bg-purple-950/10"
                }`}
              >
                <FileSearch className="w-3.5 h-3.5" />
                <span>Indizi e Prove ({clues.filter(c => c.discovered).length})</span>
              </button>

              <button
                onClick={() => setActiveTab("LOGS")}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "LOGS" 
                    ? "bg-purple-950/40 text-purple-300 border border-purple-500/30" 
                    : "text-purple-400/50 hover:text-purple-300 hover:bg-purple-950/10"
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>Access Logs</span>
              </button>

              <button
                onClick={() => setActiveTab("ACCUSE")}
                className={`w-full flex items-center space-x-3 px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "ACCUSE" 
                    ? "bg-rose-950/40 text-rose-300 border border-rose-500/40" 
                    : "text-rose-400/50 hover:text-rose-300 hover:bg-rose-950/10"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Emetti Mandato</span>
              </button>
            </nav>
          </div>

          <div className="space-y-2 mt-4 md:mt-0">
            <button
              onClick={onClose}
              className="w-full bg-[#1c0c28] border border-purple-500/30 text-purple-300 hover:bg-purple-600/30 rounded py-2 text-xs font-bold tracking-wider uppercase transition-all font-mono"
            >
              Chiudi Tablet
            </button>
            <div className="text-[9px] text-purple-600 font-mono text-center">
              SECURE_TABLET v4 // CORP_NET
            </div>
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 bg-[#050505]/90 p-6 overflow-y-auto flex flex-col h-full relative">
          <div className="scanline"></div>
          
          {activeTab === "PROFILES" && (
            <div className="flex-1 flex flex-col md:flex-row gap-6 relative z-10">
              {/* Left Column Suspect list */}
              <div className="w-full md:w-56 space-y-2">
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-3 font-mono">LISTA SOSPETTATI</h3>
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {suspects.map(sus => (
                    <button
                      key={sus.id}
                      onClick={() => setSelectedSuspectId(sus.id)}
                      className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-all ${
                        selectedSuspectId === sus.id || (!selectedSuspectId && selectedSuspect.id === sus.id)
                          ? "bg-purple-950/40 border-purple-500/60"
                          : "bg-[#0b0617]/50 border-purple-950/40 hover:border-purple-800/40"
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full animate-pulse" 
                          style={{ backgroundColor: sus.color }} 
                        />
                        <div className="leading-tight">
                          <span className="font-bold text-xs block text-slate-100">{sus.name}</span>
                          <span className="text-[10px] text-slate-400 uppercase font-mono">{sus.codename}</span>
                        </div>
                      </div>

                      {/* Manual annotation state tags */}
                      {suspectStatuses[sus.id] === "SUSPECT" && (
                        <span className="text-[8px] font-bold text-red-400 bg-red-950 px-1.5 py-0.5 rounded border border-red-500/30 font-mono">SOSPETTO</span>
                      )}
                      {suspectStatuses[sus.id] === "INNOCENT" && (
                        <span className="text-[8px] font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">SICURO</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column details */}
              <div className="flex-1 bg-black/60 border border-purple-500/20 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between border-b border-purple-500/10 pb-3 mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-100 flex items-center space-x-2">
                        <span>{selectedSuspect.name}</span>
                        <span className="text-xs font-mono font-medium text-purple-400 uppercase px-2 py-0.5 bg-purple-950/60 rounded">
                          {selectedSuspect.role}
                        </span>
                      </h2>
                      <p className="text-[10px] text-slate-400 font-mono tracking-wider mt-1">{selectedSuspect.description}</p>
                    </div>

                    {/* Annotation actions */}
                    <div className="flex space-x-1">
                      <button
                        onClick={() => toggleSuspectStatus(selectedSuspect.id, "INNOCENT")}
                        className={`px-2 py-1 text-[9px] rounded font-bold border font-mono transition-colors cursor-pointer ${
                          suspectStatuses[selectedSuspect.id] === "INNOCENT"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500"
                            : "bg-emerald-950/10 text-emerald-500/60 border-emerald-500/20 hover:text-emerald-400"
                        }`}
                      >
                        MARCA INNOCENTE
                      </button>
                      <button
                        onClick={() => toggleSuspectStatus(selectedSuspect.id, "SUSPECT")}
                        className={`px-2 py-1 text-[9px] rounded font-bold border font-mono transition-colors cursor-pointer ${
                          suspectStatuses[selectedSuspect.id] === "SUSPECT"
                            ? "bg-red-500/20 text-red-400 border-red-500"
                            : "bg-red-950/10 text-red-500/60 border-red-500/20 hover:text-red-400"
                        }`}
                      >
                        MARCA SOSPETTO
                      </button>
                    </div>
                  </div>

                  {/* Character stats & stress displays */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-black/40 p-3 rounded-lg border border-purple-950/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400 font-semibold font-mono uppercase">STRESS COGNITIVO</span>
                        <span className={`text-[10px] font-mono font-bold ${selectedSuspect.stress > 60 ? "text-red-400" : "text-purple-400"}`}>
                          {selectedSuspect.stress}%
                        </span>
                      </div>
                      <div className="stress-bar">
                        <div 
                          className={`stress-fill ${selectedSuspect.stress > 60 ? "bg-red-500" : "bg-purple-500"}`} 
                          style={{ width: `${selectedSuspect.stress}%` }} 
                        />
                      </div>
                    </div>

                    <div className="bg-black/40 p-3 rounded-lg border border-purple-950/60">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-slate-400 font-semibold font-mono">TEMORE / AGITAZIONE</span>
                        <span className="text-[10px] text-cyan-400 font-mono font-bold">{selectedSuspect.fear}%</span>
                      </div>
                      <div className="stress-bar">
                        <div 
                          className="stress-fill bg-cyan-500" 
                          style={{ width: `${selectedSuspect.fear}%` }} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Motivations & Opinions */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="bg-black/30 p-2 border border-purple-950/30 rounded">
                      <span className="text-[10px] uppercase text-purple-400/80 font-bold block mb-1">POSSIBILE MOVENTE:</span>
                      <p className="text-[11px] text-slate-300 italic">"{selectedSuspect.motive}"</p>
                    </div>

                    <div className="bg-black/30 p-2 border border-purple-950/30 rounded">
                      <span className="text-[10px] uppercase text-purple-400/80 font-bold block mb-1">ALIBI GENERATO:</span>
                      <p className="text-[11px] text-slate-300">Rintracciato nel settore ieri sera prima del blocco di sicurezza d'emergenza.</p>
                    </div>
                  </div>
                </div>

                {/* Micro relationships grid */}
                <div className="border-t border-purple-500/10 pt-3 mt-4">
                  <span className="text-[9px] font-bold text-purple-400 uppercase tracking-widest block font-mono mb-2">OPINIONI SUI COLLEGHI:</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    {Object.entries(selectedSuspect.relationships).map(([oppId, text]) => (
                      <div key={oppId} className="bg-[#06030b] border border-purple-950 p-1.5 rounded flex items-center space-x-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        <span className="font-semibold text-slate-400 uppercase shrink-0">{oppId}:</span>
                        <span className="text-slate-300 truncate italic" title={text as string}>"{text as string}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "CLUES" && (
            <div className="flex-1 space-y-4 relative z-10 animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 font-mono border-b border-purple-500/10 pb-2">ARCHIVIO REPERTI E PROVE</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clues.map(clue => (
                  <div 
                    key={clue.id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                      clue.discovered
                        ? "bg-purple-950/20 border-purple-500/40 shadow-inner"
                        : "bg-black/40 border-[#1e1e1e]/60 select-none opacity-40"
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`p-1.5 rounded text-[10px] font-mono font-bold ${
                          clue.discovered ? "bg-purple-500/20 text-purple-300" : "bg-slate-900 text-slate-500"
                        }`}>
                          {clue.type}
                        </span>
                        <h4 className={`font-bold text-sm ${clue.discovered ? "text-slate-100" : "text-slate-600"}`}>
                          {clue.discovered ? clue.name : "Indizio Non Rilevato"}
                        </h4>
                      </div>
                      
                      <p className="text-xs text-slate-400 font-mono leading-relaxed mt-1">
                        {clue.discovered ? clue.description : "Scansiona le stanze sul radar visuale per trovare tracce ricollegabili."}
                      </p>
                    </div>

                    {clue.discovered && (
                      <div className="flex items-center justify-between border-t border-purple-500/10 pt-2.5 mt-2.5 text-[10px] text-purple-400 font-mono">
                        <span className="uppercase">Ubicazione: {clue.location}</span>
                        <span className="text-purple-500 text-[9px]">COD: {clue.id.toUpperCase()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "LOGS" && (
            <div className="flex-1 space-y-4 flex flex-col h-full relative z-10 animate-fade-in">
              <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 font-mono border-b border-purple-500/10 pb-2">REGISTRO ACCESSI SCHEDE CONTROLLO SISTEMA</h2>
              
              <div className="flex-1 bg-black/60 border border-purple-950/80 rounded p-4 font-mono text-xs overflow-y-auto max-h-[300px] text-green-300/90 leading-relaxed scrollbar-thin">
                <p className="text-green-500/50 mb-2">// INIZIO ARCHIVIO ECLIPSE_MAINFRAME_W4 // TIMESTAMP: {new Date().toISOString()}</p>
                {termLogs.map((log, index) => (
                  <div key={index} className="flex space-x-2 py-1 border-b border-purple-500/5">
                    <span className="text-purple-400">[{log.timestamp}]</span>
                    <span className="text-slate-400">SISTEMA:</span>
                    <span className="text-slate-200">{log.message}</span>
                  </div>
                ))}
                <p className="text-green-500/50 mt-2">// FINE MONITORAGGIO DI RETE</p>
              </div>
            </div>
          )}

          {activeTab === "ACCUSE" && (
            <div className="flex-1 flex flex-col justify-between p-6 bg-rose-950/20 border border-rose-500/30 rounded-xl relative z-10 animate-fade-in">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto animate-bounce" />
                <h3 className="text-xl font-bold text-rose-300 font-mono uppercase tracking-widest">EMISSIONE MANDATO D'ARRESTO COATTIVO</h3>
                <p className="text-xs text-slate-350 font-mono leading-relaxed">
                  Sotto il protocollo di eccezione Eclipse City Ward 9, sei abilitato a ordinare l'arresto immediato di un sospetto.
                  Se ordini l'arresto dell'indiziato corretto, il virus viene neutralizzato e vinci la partita. Se accusi un innocente, perderai influenza e l'assassino raddoppierà lo stress!
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 my-6">
                {suspects.map(sus => (
                  <button
                    key={sus.id}
                    onClick={() => setSelectedSuspectId(sus.id)}
                    className={`p-3.5 rounded-lg border text-center font-mono font-bold transition-all cursor-pointer ${
                      selectedSuspectId === sus.id
                        ? "bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                        : "bg-black/40 border-purple-950 text-slate-400 hover:border-purple-850"
                    }`}
                  >
                    <span>{sus.name}</span>
                    <span className="text-[9px] block text-slate-400 mt-1 uppercase">Ruolo: {sus.codename}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-end space-x-3 border-t border-rose-500/10 pt-4">
                <button
                  onClick={() => setSelectedSuspectId(null)}
                  className="bg-black/60 hover:bg-black text-slate-400 px-4 py-2 rounded text-xs uppercase font-bold cursor-pointer"
                >
                  Annulla
                </button>
                <button
                  disabled={!selectedSuspectId}
                  onClick={() => selectedSuspectId && onAccuse(selectedSuspectId)}
                  className="bg-rose-600 hover:bg-rose-550 border border-rose-400 text-white px-6 py-2 rounded text-xs uppercase font-extrabold tracking-widest disabled:opacity-30 disabled:cursor-not-allowed uppercase transition-all cursor-pointer"
                >
                  CONFERMA ARRESTO immediato
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
