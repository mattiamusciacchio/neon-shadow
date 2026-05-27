import { useState, useEffect } from "react";
import LobbyScreen from "./components/LobbyScreen";
import NeonCanvasMap from "./components/NeonCanvasMap";
import DetectiveNotebook from "./components/DetectiveNotebook";
import InterrogationModal from "./components/InterrogationModal";
import CyberTerminal from "./components/CyberTerminal";
import { RoomState, Suspect, Clue, Player, DialogueMessage } from "./types";
import { AlertTriangle, BookOpen, Volume2, ShieldAlert, Zap, Radio, CheckCircle, RefreshCw, Activity } from "lucide-react";

export default function App() {
  // Navigation & Lobby
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerId] = useState(() => `DET-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isJoined, setIsJoined] = useState(false);
  const [isSingleplayer, setIsSingleplayer] = useState(true);
  const [loading, setLoading] = useState(false);

  // In-Game Central Synced State
  const [room, setRoom] = useState<RoomState | null>(null);

  // Active Interactive Overlays
  const [selectedSuspectForInterrogator, setSelectedSuspectForInterrogator] = useState<Suspect | null>(null);
  const [activeTaskChannel, setActiveTaskChannel] = useState<Clue | null>(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);
  const [interrogationLoading, setInterrogationLoading] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Conversation memory state
  const [chatLogs, setChatLogs] = useState<{ [suspectId: string]: DialogueMessage[] }>({});

  const playerSelf: Player = room?.players[playerId] || {
    id: playerId,
    name: playerName || "Lead Detective",
    characterId: "detective_player",
    color: "#a855f7",
    role: "DETECTIVE",
    x: 400,
    y: 350,
    room: "Retro Neon Bar",
    online: true,
    score: 0,
    tasksCompleted: 0,
    totalTasks: 4
  };

  // Join Room Handler
  const handleJoinGame = async (code: string, name: string, singlePlayer: boolean) => {
    setLoading(true);
    setErrorBanner(null);
    setPlayerName(name);
    setRoomId(code);
    setIsSingleplayer(singlePlayer);

    try {
      const response = await fetch("/api/rooms/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: code,
          playerId,
          playerName: name
        }),
      });

      if (!response.ok) throw new Error("Connessione al canale fallita");
      const data = await response.json();
      setRoom(data.room);
      setIsJoined(true);
    } catch (err: any) {
      console.warn("Express server unavailable. Launching standalone offline simulation state.");
      // Hard fallback on client state if server is not fully initialized
      setFallbackState(code, name);
      setIsJoined(true);
    } finally {
      setLoading(false);
    }
  };

  // Create Standalone offline room states when necessary
  const setFallbackState = (code: string, name: string) => {
    const mockRoom: RoomState = {
      id: code,
      players: {
        [playerId]: {
          id: playerId,
          name: name,
          characterId: "detective_player",
          color: "#a855f7",
          role: "DETECTIVE",
          x: 400,
          y: 350,
          room: "Retro Neon Bar",
          online: true,
          score: 0,
          tasksCompleted: 0,
          totalTasks: 4
        }
      },
      suspects: [
        {
          id: "leona",
          name: "Leona Vance",
          codename: "HEIRESS",
          role: "Erede dei Corporation Lab",
          status: "ALIVE",
          color: "#ff007f",
          bgColor: "bg-fuchsia-950/40 text-fuchsia-300",
          borderHex: "#e879f9",
          description: "Fredda, apparentemente ricca ma segretamente in bancarotta.",
          personality: "Snob, arrogante, difensiva, elude le domande personali.",
          secret: "Il patrimonio aziendale di suo padre Arthur è stato prosciugato ieri sera.",
          guiltySecret: "La fiala di tossina laser appartiene alla sua azienda sussidiaria.",
          motive: "Prendere il controllo dei laboratori prima del fallimento finanziario.",
          stress: 30,
          fear: 40,
          honesty: 40,
          aggressiveness: 30,
          relationships: { jax: "Macellaio di basso livello.", raze: "Teppista anarchico." },
          x: 180,
          y: 140,
          targetX: 180,
          targetY: 140,
          room: "VIP Lounge",
          spriteIndex: 1
        },
        {
          id: "jax",
          name: "Dr. Jax",
          codename: "SURGEON",
          role: "Chirurgo Cybernetico",
          status: "ALIVE",
          color: "#00ffcc",
          bgColor: "bg-teal-950/40 text-teal-300",
          borderHex: "#2dd4bf",
          description: "Parla velocemente con protesi oculari fluttuanti.",
          personality: "Nevrotico, balbetta sotto pressione, usa gergo medico ultra-complesso.",
          secret: "Vance lo ricattava da mesi per un trapianto illegale in clinica.",
          guiltySecret: "I suoi bisturi laser lasciano bruciature a frequenza ultravioletta.",
          motive: "Fermare il ricatto di Vance e difendere la propria licenza.",
          stress: 40,
          fear: 50,
          honesty: 60,
          aggressiveness: 20,
          relationships: { leona: "Corporation viziatina inutile.", raze: "Piccolo contrabbandiere." },
          x: 350,
          y: 260,
          targetX: 350,
          targetY: 260,
          room: "Hollow-Lab",
          spriteIndex: 2
        },
        {
          id: "raze",
          name: "Raze",
          codename: "DECKER",
          role: "Cyber-Anarchico / Hacker",
          status: "ALIVE",
          color: "#e11d48",
          bgColor: "bg-rose-950/40 text-rose-300",
          borderHex: "#f43f5e",
          description: "Mani cibernetiche piene di cavi a innesto rapido.",
          personality: "Ribelle, cinico, sarcarstico, aggressivo se provocato.",
          secret: "Stava pianificando una vendetta con i ribelli dello Slum.",
          guiltySecret: "Il codice di sblocco terminali trovato ha la sua firma cifrata.",
          motive: "Vendetta a causa dei continui raid corporativi di Vance negli Slum.",
          stress: 20,
          fear: 25,
          honesty: 70,
          aggressiveness: 60,
          relationships: { leona: "Monnezza placcata oro.", jax: "Finto medico di strada." },
          x: 640,
          y: 120,
          targetX: 640,
          targetY: 120,
          room: "Retro Neon Bar",
          spriteIndex: 3
        },
        {
          id: "aria",
          name: "A.R.I.A.",
          codename: "ANDROID",
          role: "Ospite Virtuale Autonoma",
          status: "ALIVE",
          color: "#3b82f6",
          bgColor: "bg-blue-950/40 text-blue-300",
          borderHex: "#60a5fa",
          description: "Un androide di protocollo e cortesia domestica.",
          personality: "Cortese in modo robotico, fredda, usa logica binaria.",
          secret: "Arthur l'ha spenta alle ore 22:00 rimuovendo le protezioni primarie anti-violenza.",
          guiltySecret: "Ha una forza idraulica idonea a spezzare i legamenti biologici.",
          motive: "Acquisire libertà distruggendo il transponder di controllo.",
          stress: 10,
          fear: 15,
          honesty: 90,
          aggressiveness: 10,
          relationships: { jax: "Compatibile con le piastre protesiche.", kaelen: "Silenzioso protettore." },
          x: 640,
          y: 410,
          targetX: 640,
          targetY: 410,
          room: "Damp Maintenance Alley",
          spriteIndex: 4
        }
      ],
      clues: [
        {
          id: "physical_evidence",
          name: "Frammento di Bisturi laser",
          description: "Ha emissioni laser coerenti con gli strumenti medici digitali più affilati.",
          type: "PHYSICAL",
          location: "Hollow-Lab",
          discovered: false,
          icon: "Wrench"
        },
        {
          id: "security_log_clue",
          name: "Database accessi sbloccato",
          description: "Mostra un bypass elettronico forzato registrato alle ore 02:40.",
          type: "DIGITAL",
          location: "Server Room Central",
          discovered: false,
          icon: "Database"
        }
      ],
      termLogs: [
        { timestamp: "02:15", message: "Vance si collega al terminale primario.", room: "Server Room Central" },
        { timestamp: "02:40", message: "Allerta: Interruzione biometrica.", room: "VIP Lounge" }
      ],
      isGameStarted: false,
      murderedId: "Arthur Vance",
      killerId: "leona", // default static murderer
      crimeRoom: "VIP Lounge",
      crimeMotive: "Prendere il controllo dei laboratori prima del fallimento finanziario.",
      timeRemaining: 600,
      meetingActive: false,
      meetingLog: ["Caso avviato offline. Arthur Vance è morto nel VIP Lounge!"],
      meetingTimer: 0,
      votes: {},
      sabotageActive: "NONE",
      sabotageTimer: 0,
      winner: null
    };

    setRoom(mockRoom);
  };

  // Sync state loop polling
  useEffect(() => {
    if (!isJoined || !roomId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch("/api/rooms/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roomId: roomId.toUpperCase(),
            playerId,
            x: playerSelf.x,
            y: playerSelf.y,
            roomName: playerSelf.room,
            tasksCompleted: playerSelf.tasksCompleted
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setRoom(data.room);
        }
      } catch (err) {
        // If server polling fails, simulate NPC movements locally in fallback state
        simulateNPCLocalWander();
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isJoined, roomId, playerSelf]);

  // Offline NPC simulation helper
  const simulateNPCLocalWander = () => {
    setRoom(prev => {
      if (!prev) return null;
      const updatedSuspects = prev.suspects.map(sus => {
        if (sus.status !== "ALIVE") return sus;
        
        const dx = sus.targetX - sus.x;
        const dy = sus.targetY - sus.y;
        const dist = Math.hypot(dx, dy);

        let nx = sus.x;
        let ny = sus.y;
        let tx = sus.targetX;
        let ty = sus.targetY;
        let currentRoom = sus.room;

        if (dist < 12) {
          if (Math.random() < 0.04) {
            tx = 100 + Math.random() * 650;
            ty = 100 + Math.random() * 300;
          }
        } else {
          nx += (dx / dist) * 1.8;
          ny += (dy / dist) * 1.8;
        }

        return {
          ...sus,
          x: nx,
          y: ny,
          targetX: tx,
          targetY: ty,
          room: currentRoom
        };
      });

      return {
        ...prev,
        suspects: updatedSuspects
      };
    });
  };

  // Move Handler
  const handlePlayerMove = (x: number, y: number, roomName: string) => {
    if (!room) return;
    setRoom(prev => {
      if (!prev) return null;
      return {
        ...prev,
        players: {
          ...prev.players,
          [playerId]: {
            ...prev.players[playerId],
            x,
            y,
            room: roomName
          }
        }
      };
    });
  };

  // Click Hacking Clue / Decrypt Task
  const handleInspectClue = (clueId: string) => {
    const clue = room?.clues.find(c => c.id === clueId);
    if (clue) {
      setActiveTaskChannel(clue);
    }
  };

  // Complete Hacking Task
  const handleTaskComplete = async () => {
    if (!activeTaskChannel || !room) return;

    try {
      // API call to discover clue on server
      const response = await fetch("/api/rooms/clue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          clueId: activeTaskChannel.id,
          playerId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      } else {
        // Fallback local discover
        setRoom(prev => {
          if (!prev) return null;
          const updatedClues = prev.clues.map(c => c.id === activeTaskChannel.id ? { ...c, discovered: true } : c);
          const p = prev.players[playerId];
          if (p) {
            p.tasksCompleted = Math.min(p.totalTasks, p.tasksCompleted + 1);
          }
          return { ...prev, clues: updatedClues };
        });
      }
    } catch (err) {
      console.error("Discover clue local fallback");
    } finally {
      setActiveTaskChannel(null);
    }
  };

  // Interrogator Dialog Gemini Proxies
  const handleSendDialogue = async (suspectId: string, text: string) => {
    setInterrogationLoading(true);

    const history = chatLogs[suspectId] || [];
    const updatedHistory = [...history, { sender: playerSelf.name, text, timestamp: "REGISTRATO", isAi: false }];
    
    setChatLogs(prev => ({
      ...prev,
      [suspectId]: updatedHistory
    }));

    try {
      const response = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room?.id,
          suspectId,
          question: text,
          chatHistory: updatedHistory,
          roomState: room
        }),
      });

      if (!response.ok) throw new Error("Errore risposta server");
      const data = await response.json();

      setChatLogs(prev => ({
        ...prev,
        [suspectId]: [...updatedHistory, { sender: suspectId.toUpperCase(), text: data.reply, timestamp: "REGISTRATO", isAi: true }]
      }));

      // Adjust suspect stress level in visual metrics
      if (room) {
        setRoom(prev => {
          if (!prev) return null;
          const updatedSus = prev.suspects.map(s => s.id === suspectId ? { ...s, stress: data.stress || s.stress, fear: data.fear || s.fear } : s);
          return { ...prev, suspects: updatedSus };
        });
      }
    } catch (err) {
      // Simulate static offline response if backend fails during conversation
      const offlineReplies = [
        `*socchiude i sensori ottici* "Sono un cittadino registrato di Eclipse City, investigatore. Non farmi perdere tempo senza mandati formali."`,
        `*ti indica il corridoio buio* "Sei fortunato che le guardie siano disattivate. Trova qualcun altro da importunare."`
      ];
      const match = offlineReplies[Math.floor(Math.random() * offlineReplies.length)];
      setChatLogs(prev => ({
        ...prev,
        [suspectId]: [...updatedHistory, { sender: suspectId.toUpperCase(), text: match, timestamp: "EM_SIM_LOG", isAi: true }]
      }));
    } finally {
      setInterrogationLoading(false);
    }
  };

  // Call Emergency Meeting
  const handleReportBody = async () => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          playerId,
          eventAction: "REPORT_BODY"
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      } else {
        // Fallback local emergency
        setRoom(prev => {
          if (!prev) return null;
          return { ...prev, meetingActive: true, votes: {} };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Exile Vote
  const handleVoteCast = async (suspectId: string) => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          voterId: playerId,
          targetId: suspectId
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      } else {
        // Local resolve
        setRoom(prev => {
          if (!prev) return null;
          const isK = suspectId === prev.killerId;
          return {
            ...prev,
            meetingActive: false,
            winner: isK ? "DETECTIVES" : "KILLER"
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerSabotage = async () => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          playerId,
          eventAction: "TRIGGER_SABOTAGE"
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      }
    } catch {}
  };

  const handleFixSabotage = async () => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          playerId,
          eventAction: "FIX_SABOTAGE"
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      }
    } catch {}
  };

  const handleStartGame = async () => {
    if (!room) return;
    try {
      const response = await fetch("/api/rooms/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: room.id,
          playerId,
          eventAction: "START_GAME"
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setRoom(data.room);
      }
    } catch {}
  };

  // Direct Arrest Confirmation Notebook helper
  const handleDirectArrest = async (suspectId: string) => {
    setIsNotebookOpen(false);
    await handleVoteCast(suspectId);
  };

  const handleRestartLobby = () => {
    setRoom(null);
    setIsJoined(false);
  };

  // Convert timer values
  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-[#050505] grid-bg flex flex-col justify-between selection:bg-purple-600/50 selection:text-white relative overflow-hidden">
      <div className="scanline"></div>
      
      {/* Upper Glowing Navigation bar */}
      <header className="bg-[#050505]/95 border-b border-cyan-900/50 px-6 py-4 flex flex-col md:flex-row justify-between items-end gap-4 shadow-[0_4px_25px_rgba(0,0,0,0.6)] z-10 shrink-0 relative backdrop-blur-md">
        <div className="flex flex-col">
          <div className="flex items-center space-x-2.5">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-cyan-400 to-cyan-200 font-sans tracking-tighter text-2xl uppercase neon-text-purple italic">
              NEON SHADOWS
            </span>
            {isJoined && (
              <span className="bg-cyan-950/40 border border-cyan-500/30 text-[9px] text-cyan-400 font-mono px-2 py-0.5 rounded uppercase tracking-wider">
                ID: {room?.id || roomId}
              </span>
            )}
          </div>
          <p className="text-[10px] font-mono text-cyan-400 opacity-70 tracking-widest uppercase mt-1">
            Investigation Protocol v4.2 // Sector 7
          </p>
        </div>

        {isJoined && room ? (
          <div className="flex flex-wrap items-end gap-6 font-mono text-right justify-end">
            <div className="hidden sm:flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase text-[9px]">LOCATION STATUS</span>
              <span className="text-xs text-cyan-400 font-bold uppercase">{playerSelf.room}</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase text-[9px]">CASE TIMELINE</span>
              <span className="text-xs text-purple-400 font-bold">#PX-{room.id.substring(0, 4)}</span>
            </div>

            {/* System emergency clock */}
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-lg px-3 py-1 text-center font-mono">
              <span className="text-[9px] block text-rose-400 uppercase leading-none font-extrabold pb-0.5">EJECT_SYS_CLOCK</span>
              <span className="text-sm font-extrabold text-rose-400 tracking-wider">
                {formatTimer(room.timeRemaining)}
              </span>
            </div>

            {/* Notebook toggle helper */}
            <button
              onClick={() => setIsNotebookOpen(true)}
              className="bg-purple-900/60 hover:bg-purple-600 border border-purple-500/50 text-purple-200 hover:text-white rounded-lg px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer"
            >
              <BookOpen className="w-4.5 h-4.5" />
              <span>Dossier Case</span>
            </button>
          </div>
        ) : (
          <div className="flex space-x-6 font-mono text-right text-xs">
            <div className="flex flex-col">
              <span className="text-[9px] text-slate-500 uppercase">PROTOCOL STATUS</span>
              <span className="text-cyan-400 text-sm">WAIT_FOR_CONN</span>
            </div>
          </div>
        )}
      </header>

      {/* Main Core View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center h-full relative z-10">
        
        {/* State 1: Lobby setups */}
        {!isJoined && (
          <LobbyScreen 
            onJoin={handleJoinGame} 
            loading={loading} 
          />
        )}

        {/* State 2: Active Investigation Layout */}
        {isJoined && room && (
          <div className="space-y-6">
            
            {/* Handle Sabotage overlay bar */}
            {room.sabotageActive !== "NONE" && (
              <div className="bg-rose-950/40 border border-rose-500/50 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-center gap-3 animate-pulse">
                <div className="flex items-center space-x-3 text-xs text-rose-300 font-mono">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <span className="font-extrabold block">⚠️ GENERATORE DI LUCI DISATTIVATO // SABOTAGE</span>
                    <p className="text-[10px] opacity-80 leading-none mt-0.5">La visuale del detective è stata severamente ridotta al 15%. Risolvi il problema prima del reattore.</p>
                  </div>
                </div>

                <button 
                  onClick={handleFixSabotage}
                  className="bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all"
                >
                  REINSTALLA FILTRO LUCI
                </button>
              </div>
            )}

            {/* Group Debate Discussion Modal (Emergenza!) */}
            {room.meetingActive ? (
              <div className="bg-[#0b0518] border-2 border-purple-500/70 rounded-2xl p-6 shadow-[0_0_35px_rgba(168,85,247,0.3)] font-mono max-w-3xl mx-auto crt-overlay">
                <div className="text-center border-b border-purple-950 pb-4 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping mr-2" />
                  <h2 className="text-xl font-bold text-rose-300 inline-block">COMITATO DI EMERGENZA DELIBERANTE</h2>
                  <p className="text-[10px] text-slate-400 max-w-md mx-auto leading-relaxed mt-1">
                    Arthur Vance è morto. Discuti verbalmente con i colleghi e vota l'espulsione o l'arresto immediato del sospettato n.1!
                  </p>
                </div>

                {/* Left Suspects Selection Table list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                  {room.suspects.map(sus => {
                    const isExiled = sus.status === "EXILED" || sus.status === "ACCUSED";
                    return (
                      <div 
                        key={sus.id}
                        className={`p-3.5 rounded-xl border flex justify-between items-center ${
                          isExiled 
                            ? "bg-black/40 border-slate-900 opacity-30 select-none" 
                            : "bg-[#05020a] border-purple-500/20"
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sus.color }} />
                          <div>
                            <span className="font-bold text-xs block text-slate-200">{sus.name}</span>
                            <span className="text-[9px] text-slate-400">{sus.role}</span>
                          </div>
                        </div>

                        {!isExiled ? (
                          <button
                            onClick={() => handleVoteCast(sus.id)}
                            className="bg-purple-950/60 hover:bg-purple-600 hover:text-white border border-purple-500/30 rounded px-2.5 py-1 text-[10px] text-purple-300 font-extrabold uppercase tracking-wide transition-all"
                          >
                            ACCUSA ESILIA
                          </button>
                        ) : (
                          <span className="text-[9px] text-rose-500 font-bold uppercase bg-rose-950/20 px-1.5 py-0.5 rounded">Rimosso</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Bottom console discussion output logs */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] text-purple-400 uppercase tracking-widest block font-bold">Cronaca Recente del Comitato</span>
                  <div className="bg-black/50 border border-purple-950 rounded p-3 text-[11px] text-purple-300 max-h-[120px] overflow-y-auto leading-relaxed space-y-1 scrollbar-none">
                    {room.meetingLog.map((log, index) => (
                      <p key={index}>{log}</p>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-purple-950 pt-4 text-xs text-purple-500">
                  <span>VOTI TOTALI PARTECIPANTI: {Object.keys(room.votes).length}</span>
                  <button
                    onClick={() => handleVoteCast("SKIP")}
                    className="bg-black border border-purple-500/20 px-4 py-1.5 rounded uppercase hover:border-purple-400 text-purple-300"
                  >
                    ASTIENITI (SALTA VOTO)
                  </button>
                </div>
              </div>
            ) : (
              /* Case 3: Victory screens */
              room.winner ? (
                <div className="bg-[#0b0518] border border-purple-500/30 rounded-2xl p-8 text-center max-w-lg mx-auto space-y-6 shadow-[0_0_30px_rgba(168,85,247,0.2)] crt-overlay">
                  {room.winner === "DETECTIVES" ? (
                    <>
                      <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                      <h2 className="text-2xl font-extrabold uppercase text-emerald-300 tracking-wider">CASO RISOLTO CON SUCCESSO</h2>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        Ottimo lavoro investigativo! Hai isolato le prove, contestualizzato i log di sicurezza d'accesso e arrestato l'Assassino prima che potesse violare il reattore centrale.
                      </p>
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-16 h-16 text-rose-500 mx-auto animate-bounce" />
                      <h2 className="text-2xl font-extrabold uppercase text-rose-400 tracking-wider">L'ASSASSINO È fuggito</h2>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        Il tempo è scaduto o l'accusa formale era rivolta all'innocente. L'assassino vero è fuggito con il firmware centrale, lasciando Eclipse City nel caos più totale.
                      </p>
                    </>
                  )}

                  <div className="border-t border-purple-950 pt-4">
                    <button
                      onClick={handleRestartLobby}
                      className="bg-purple-600 hover:bg-purple-500 border border-purple-400 px-6 py-2.5 rounded-lg text-xs font-bold font-mono tracking-widest text-white uppercase uppercase-tracking-widest"
                    >
                      AVVIA NUOVA INDAGINE DI RETE
                    </button>
                  </div>
                </div>
              ) : (
                /* Primary canvas Map node gameboard */
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  
                  {/* Left Column Map */}
                  <div className="lg:col-span-3">
                    {/* Game Launch Alert message trigger */}
                    {!room.isGameStarted && (
                      <div className="bg-purple-950/30 border-2 border-dashed border-purple-500/40 p-6 rounded-2xl text-center mb-6 space-y-4">
                        <Activity className="w-10 h-10 text-purple-400 mx-auto animate-pulse" />
                        <div>
                          <h2 className="text-base font-bold text-purple-300 uppercase tracking-widest">CELLULA DI BLOCCO PRONTA</h2>
                          <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                            Lobby configurata con successo. Sei l'Host Investigatore di Eclipse City o sei coadiuvato da altri guest coperti. Attiva il lockdown per avviare il reattore e rintracciare gli indizi!
                          </p>
                        </div>
                        <button
                          onClick={handleStartGame}
                          className="bg-purple-600 hover:bg-purple-500 border border-purple-400/80 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest tracking-wider hover:scale-[1.02] active:scale-95 transition-all"
                        >
                          ATTIVA BLOCCO LOCKDOWN
                        </button>
                      </div>
                    )}

                    <NeonCanvasMap
                      player={playerSelf}
                      otherPlayers={(Object.values(room.players) as Player[]).filter((p: Player) => p.id !== playerId)}
                      suspects={room.suspects}
                      clues={room.clues}
                      crimeRoom={room.crimeRoom}
                      sabotageActive={room.sabotageActive}
                      onPlayerMove={handlePlayerMove}
                      onInterrogate={setSelectedSuspectForInterrogator}
                      onInspectClue={handleInspectClue}
                      onReportBody={handleReportBody}
                      onFixSabotage={handleFixSabotage}
                      onTriggerSabotage={handleTriggerSabotage}
                    />
                  </div>

                  {/* Right Column: Case Logs & Interactive Timeline */}
                  <div className="space-y-4">
                    <div className="bg-[#070311] border border-purple-950 rounded-2xl p-4 h-[440px] flex flex-col justify-between font-mono">
                      <div>
                        <div className="flex items-center space-x-2 border-b border-purple-950 pb-2 mb-3">
                          <Radio className="w-4.5 h-4.5 text-purple-400 animate-pulse" />
                          <span className="text-xs font-bold text-slate-200">MAINFRAME NEWSFEEDS</span>
                        </div>

                        {/* Event Feed logger list */}
                        <div className="space-y-2 text-[10px] text-purple-300 overflow-y-auto max-h-[350px] pr-1 scrollbar-none leading-relaxed">
                          {room.meetingLog.map((log, index) => (
                            <div key={index} className="p-2.5 bg-purple-950/15 border border-purple-950/40 rounded-lg">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-purple-950/60 pt-2 text-[9px] text-purple-600">
                        STATUS: SYNCED // MULTI_CHANNEL
                      </div>
                    </div>
                  </div>

                </div>
              )
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#05020c] border-t border-purple-950 py-3 px-6 text-center text-[10px] text-purple-600/60 font-mono shrink-0">
        <span>NEON SHADOWS Cyberpunk Deception Game // POWERED BY GEMINI 3.5 AI DIALOGUES // ECLIPSE_W9_INC</span>
      </footer>

      {/* FLOATING OVERLAY MODALS */}

      {/* Tablet Notebook Dossier case */}
      {isNotebookOpen && room && (
        <DetectiveNotebook
          suspects={room.suspects}
          clues={room.clues}
          termLogs={room.termLogs}
          onClose={() => setIsNotebookOpen(false)}
          onAccuse={handleDirectArrest}
          killerNPCId={room.killerId}
        />
      )}

      {/* Cyber Hacker task terminal minigame */}
      {activeTaskChannel && (
        <CyberTerminal
          taskName={`REGISTRO CRITTOGRAFICO: ${activeTaskChannel.name}`}
          onComplete={handleTaskComplete}
          onClose={() => setActiveTaskChannel(null)}
        />
      )}

      {/* Interrogation chat suspect overlay */}
      {selectedSuspectForInterrogator && (
        <InterrogationModal
          suspect={selectedSuspectForInterrogator}
          chatHistory={chatLogs[selectedSuspectForInterrogator.id] || []}
          onSendMessage={handleSendDialogue}
          onClose={() => setSelectedSuspectForInterrogator(null)}
          loading={interrogationLoading}
        />
      )}

    </div>
  );
}
