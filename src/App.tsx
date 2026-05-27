import { useState, useEffect } from "react";
import LobbyScreen from "./components/LobbyScreen";
import NeonCanvasMap from "./components/NeonCanvasMap";
import DetectiveNotebook from "./components/DetectiveNotebook";
import InterrogationModal from "./components/InterrogationModal";
import CyberTerminal from "./components/CyberTerminal";
import { RoomState, Suspect, Clue, Player, DialogueMessage } from "./types";
import { generateProceduralRoom, interrogateSuspectDirect, ROOM_IDS } from "./lib/gameEngine";
import { AlertTriangle, BookOpen, Volume2, ShieldAlert, Zap, Radio, CheckCircle, RefreshCw, Activity } from "lucide-react";

export default function App() {
  // Navigation & Lobby
  const [roomId, setRoomId] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [playerId] = useState(() => `DET-${Math.floor(1000 + Math.random() * 9000)}`);
  const [isJoined, setIsJoined] = useState(false);
  const [isSingleplayer, setIsSingleplayer] = useState(true);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("gemini_api_key") || "");

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

  // Join Room Handler (fully client-side database logic)
  const handleJoinGame = (code: string, name: string, singlePlayer: boolean, inputApiKey: string) => {
    setLoading(true);
    setErrorBanner(null);
    setPlayerName(name);
    setRoomId(code);
    setIsSingleplayer(singlePlayer);
    if (inputApiKey) {
      setApiKey(inputApiKey);
      localStorage.setItem("gemini_api_key", inputApiKey);
    }

    const normCode = code.trim().toUpperCase();
    const storageKey = `neon_room_${normCode}`;
    
    setTimeout(() => {
      let activeRoom: RoomState;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        try {
          activeRoom = JSON.parse(stored);
          if (!activeRoom.players[playerId]) {
            activeRoom.players[playerId] = {
              id: playerId,
              name: name,
              characterId: `detective_guest_${Object.keys(activeRoom.players).length}`,
              color: "#" + Math.floor(100 * Math.random() + 155).toString(16) + Math.floor(100 * Math.random() + 155).toString(16) + "ff",
              role: "DETECTIVE",
              x: 400 + Math.random() * 80,
              y: 350 + Math.random() * 80,
              room: "Retro Neon Bar",
              online: true,
              score: 0,
              tasksCompleted: 0,
              totalTasks: 4
            };
            activeRoom.meetingLog.push(`${name} si è unito alle indagini nel settore.`);
          } else {
            activeRoom.players[playerId].online = true;
          }
        } catch (e) {
          activeRoom = generateProceduralRoom(normCode, playerId, name);
        }
      } else {
        activeRoom = generateProceduralRoom(normCode, playerId, name);
      }

      localStorage.setItem(storageKey, JSON.stringify(activeRoom));
      setRoom(activeRoom);
      setIsJoined(true);
      setLoading(false);
    }, 400);
  };

  // Listen for storage events to sync multiplayer across tabs/windows in real time
  useEffect(() => {
    if (!isJoined || !roomId) return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `neon_room_${roomId.toUpperCase()}` && e.newValue) {
        try {
          const updatedRoom = JSON.parse(e.newValue);
          setRoom(updatedRoom);
        } catch (err) {
          console.error("Failed to sync room state from storage change:", err);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [isJoined, roomId]);

  // Periodic simulation loop tick (Host-driven coordinate sync and time count to avoid double-ticks in multi-tab)
  useEffect(() => {
    if (!isJoined || !roomId) return;

    const interval = setInterval(() => {
      const storageKey = `neon_room_${roomId.toUpperCase()}`;
      const stored = localStorage.getItem(storageKey);
      if (!stored) return;

      try {
        let currentRoom = JSON.parse(stored) as RoomState;
        
        // Update my own online presence and coordinates in the central pool
        if (currentRoom.players[playerId]) {
          currentRoom.players[playerId].x = playerSelf.x;
          currentRoom.players[playerId].y = playerSelf.y;
          currentRoom.players[playerId].room = playerSelf.room;
          currentRoom.players[playerId].tasksCompleted = playerSelf.tasksCompleted;
          currentRoom.players[playerId].online = true;
        }

        // Alphabetically lowest Player ID serves as peer host to drive world-time and suspect behavior
        const playerIds = Object.keys(currentRoom.players).filter(pid => currentRoom.players[pid].online).sort();
        const isHost = playerIds[0] === playerId;

        if (isHost || isSingleplayer) {
          if (currentRoom.isGameStarted && !currentRoom.meetingActive && currentRoom.winner === null) {
            // Decrement round timer
            currentRoom.timeRemaining = Math.max(0, currentRoom.timeRemaining - 1);
            if (currentRoom.timeRemaining <= 0) {
              currentRoom.winner = "KILLER";
            }

            // Move NPCs autonomously
            currentRoom.suspects = currentRoom.suspects.map(sus => {
              if (sus.status !== "ALIVE") return sus;
              
              const dx = sus.targetX - sus.x;
              const dy = sus.targetY - sus.y;
              const dist = Math.hypot(dx, dy);

              let nx = sus.x;
              let ny = sus.y;
              let tx = sus.targetX;
              let ty = sus.targetY;
              let currentRoomName = sus.room;

              if (dist < 12) {
                if (Math.random() < 0.05) {
                  tx = 100 + Math.random() * 650;
                  ty = 100 + Math.random() * 320;
                  if (Math.random() < 0.18) {
                    currentRoomName = ROOM_IDS[Math.floor(Math.random() * ROOM_IDS.length)];
                  }
                }
              } else {
                const angle = Math.atan2(dy, dx);
                nx += Math.cos(angle) * 1.5;
                ny += Math.sin(angle) * 1.5;
              }

              return {
                ...sus,
                x: nx,
                y: ny,
                targetX: tx,
                targetY: ty,
                room: currentRoomName
              };
            });

            // Sabotage timer ticking
            if (currentRoom.sabotageActive !== "NONE") {
              currentRoom.sabotageTimer = Math.max(0, currentRoom.sabotageTimer - 1);
              if (currentRoom.sabotageTimer <= 0) {
                currentRoom.sabotageActive = "NONE";
              }
            }
          }
        }

        localStorage.setItem(storageKey, JSON.stringify(currentRoom));
        setRoom(currentRoom);

      } catch (err) {
        console.error("Local sync error:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isJoined, roomId, playerId, playerSelf.x, playerSelf.y, playerSelf.room, playerSelf.tasksCompleted, isSingleplayer]);

  // Move Handler (immediate reactive repaint + backend local write)
  const handlePlayerMove = (x: number, y: number, roomName: string) => {
    if (!room) return;
    setRoom(prev => {
      if (!prev) return null;
      const updatedPlayers = {
        ...prev.players,
        [playerId]: {
          ...prev.players[playerId],
          x,
          y,
          room: roomName
        }
      };
      
      const updated = {
        ...prev,
        players: updatedPlayers
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleInspectClue = (clueId: string) => {
    const clue = room?.clues.find(c => c.id === clueId);
    if (clue) {
      setActiveTaskChannel(clue);
    }
  };

  // Safe task completion
  const handleTaskComplete = () => {
    if (!activeTaskChannel || !room) return;

    setRoom(prev => {
      if (!prev) return null;
      
      const updatedClues = prev.clues.map(c => 
        c.id === activeTaskChannel.id ? { ...c, discovered: true } : c
      );
      
      const p = prev.players[playerId];
      if (p) {
        p.tasksCompleted = Math.min(p.totalTasks, p.tasksCompleted + 1);
      }
      
      const collectorName = p ? p.name : "Qualcuno";
      const updatedLog = [
        ...prev.meetingLog,
        `🔍 INDIZIO TROVATO: ${collectorName} ha analizzato: "${activeTaskChannel.name}" nel ${activeTaskChannel.location}.`
      ];

      // Dynamic escalation: increase tension of the killer NPC!
      const updatedSus = prev.suspects.map(s => {
        if (s.id === prev.killerId) {
          return {
            ...s,
            stress: Math.min(100, s.stress + 15),
            fear: Math.min(100, s.fear + 20),
            honesty: Math.max(0, s.honesty - 5)
          };
        }
        return s;
      });

      const updated = {
        ...prev,
        clues: updatedClues,
        meetingLog: updatedLog,
        suspects: updatedSus
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });

    setActiveTaskChannel(null);
  };

  // Interrogator Conversation using either Direct Gemini API or localized offline fallback
  const handleSendDialogue = async (suspectId: string, text: string) => {
    setInterrogationLoading(true);

    const history = chatLogs[suspectId] || [];
    const updatedHistory = [...history, { sender: playerSelf.name, text, timestamp: "REGISTRATO", isAi: false }];
    
    setChatLogs(prev => ({
      ...prev,
      [suspectId]: updatedHistory
    }));

    if (apiKey && room) {
      try {
        const responseData = await interrogateSuspectDirect(suspectId, text, updatedHistory, room, apiKey);
        
        setChatLogs(prev => ({
          ...prev,
          [suspectId]: [...updatedHistory, { sender: suspectId.toUpperCase(), text: responseData.reply, timestamp: "REGISTRATO", isAi: true }]
        }));

        setRoom(prev => {
          if (!prev) return null;
          const updatedSus = prev.suspects.map(s => 
            s.id === suspectId ? { ...s, stress: responseData.stress, fear: responseData.fear } : s
          );
          const updated = { ...prev, suspects: updatedSus };
          localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
          return updated;
        });

      } catch (err: any) {
        console.warn("Direct Gemini call errored. Utilizing simulated visual response.", err);
        triggerSimulatedDialogue(suspectId, updatedHistory);
      } finally {
        setInterrogationLoading(false);
      }
    } else {
      // Trigger simple cyberpunk style fallback
      triggerSimulatedDialogue(suspectId, updatedHistory);
      setInterrogationLoading(false);
    }
  };

  // Automated simulated dialogue responses
  const triggerSimulatedDialogue = (suspectId: string, updatedHistory: DialogueMessage[]) => {
    const suspect = room?.suspects.find(s => s.id === suspectId);
    const code = suspect?.codename || "SUSPECT";
    
    const staticReplies = [
      `*sistema l'innesto biomeccanico* "Questa città fagocita i curiosi, investigatore. Non so nulla di Arthur Vance tranne che pagava in chip usati."`,
      `*scuote i circuiti interni in tensione* "Cerca altrove. Il bypass dei laboratori richiede credenziali che non possiedo. Non vedi il mio stress?"`,
      `*ti fissa freddamente* "Ero nei passaggi industriali a riparare cablaggi alle due. Vuoi analizzare i log d'alimentazione? Chiedi ad A.R.I.A."`,
      `*un indicatore led rosso lampeggia* "Vance nascondeva transazioni illegali in un database segreto. Se trovi quel file capirai la rabbia di tutti noi."`
    ];

    const matchText = staticReplies[Math.floor(Math.random() * staticReplies.length)];
    
    setChatLogs(prev => ({
      ...prev,
      [suspectId]: [...updatedHistory, { sender: suspectId.toUpperCase(), text: matchText, timestamp: "SIM_LOG", isAi: true }]
    }));

    // Raise stress slightly upon questioning
    if (room) {
      setRoom(prev => {
        if (!prev) return null;
        const updatedSus = prev.suspects.map(s => {
          if (s.id === suspectId) {
            return {
              ...s,
              stress: Math.min(100, s.stress + 4),
              fear: Math.min(100, s.fear + 6)
            };
          }
          return s;
        });
        const updated = { ...prev, suspects: updatedSus };
        localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
        return updated;
      });
    }
  };

  // Emergency meeting triggered by body report
  const handleReportBody = () => {
    if (!room) return;
    setRoom(prev => {
      if (!prev) return null;
      const reporterName = prev.players[playerId]?.name || "Un investigatore";
      const updatedLog = [
        ...prev.meetingLog,
        `🚨 CRIME REPORTED: ${reporterName} ha convocato una cellula straordinaria di discussione!`
      ];
      const updated = {
        ...prev,
        isGameStarted: true,
        meetingActive: true,
        votes: {},
        meetingLog: updatedLog
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });
  };

  // Exile Voted suspects
  const handleVoteCast = (accusedSuspectId: string) => {
    if (!room) return;

    setRoom(prev => {
      if (!prev) return null;
      
      const newVotes = { ...prev.votes, [playerId]: accusedSuspectId };
      const voterName = prev.players[playerId]?.name || "Investigatore";
      
      let targetName = "Astenuto";
      if (accusedSuspectId !== "SKIP") {
        const susTarget = prev.suspects.find(s => s.id === accusedSuspectId);
        targetName = susTarget ? susTarget.name : accusedSuspectId;
      }

      const updatedLog = [
        ...prev.meetingLog,
        `🗳️ Voto espresso: ${voterName} sospetta formalmente di [${targetName}].`
      ];

      let updatedWinner = prev.winner;
      let updatedSuspects = prev.suspects;

      // Count active online human players
      const activeHumans = Object.keys(prev.players).filter(pid => prev.players[pid].online);
      const allVoted = Object.keys(newVotes).length >= activeHumans.length;

      let resetVotes = { ...newVotes };

      if (allVoted) {
        const voteCounts: { [id: string]: number } = {};
        Object.values(newVotes).forEach((vid) => {
          const vidStr = String(vid);
          voteCounts[vidStr] = (voteCounts[vidStr] || 0) + 1;
        });

        let maxVotes = 0;
        let finalAccusedId = "";
        let tie = false;

        Object.entries(voteCounts).forEach(([vid, count]) => {
          if (count > maxVotes) {
            maxVotes = count;
            finalAccusedId = vid;
            tie = false;
          } else if (count === maxVotes) {
            tie = true;
          }
        });

        if (tie || finalAccusedId === "SKIP" || finalAccusedId === "") {
          updatedLog.push("⚖️ RISULTATO: Nessun verdetto concorde. Il comitato si scioglie senza arrestare nessuno.");
        } else {
          const isAccusedKiller = finalAccusedId === prev.killerId;
          const convicted = prev.suspects.find(s => s.id === finalAccusedId);

          if (convicted) {
            updatedSuspects = prev.suspects.map(s => 
              s.id === finalAccusedId ? { ...s, status: "EXILED" as const } : s
            );
          }

          if (isAccusedKiller) {
            updatedLog.push(`🎉 VERDETTO CORRETTO: [${convicted?.name || finalAccusedId}] era l'Assassino! Arthur Vance è stato vendicato. Caso Chiuso con successo!`);
            updatedWinner = "DETECTIVES";
          } else {
            updatedLog.push(`❌ ERRORE DRAMMATICO: [${convicted?.name || finalAccusedId}] è stato arrestato ma era INNOCENTE! L'assassino cammina ancora tra noi...`);
            // innocent accused drops killer stress
            updatedSuspects = updatedSuspects.map(s => {
              if (s.id === prev.killerId) {
                return {
                  ...s,
                  stress: Math.max(10, s.stress - 30),
                  fear: Math.max(10, s.fear - 25)
                };
              }
              return s;
            });
          }
        }
        resetVotes = {};
      }

      const updated = {
        ...prev,
        votes: allVoted ? {} : newVotes,
        meetingActive: !allVoted,
        meetingLog: updatedLog,
        winner: updatedWinner,
        suspects: updatedSuspects
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleTriggerSabotage = () => {
    if (!room) return;
    setRoom(prev => {
      if (!prev) return null;
      const updatedLog = [
        ...prev.meetingLog,
        "⚠️ ATTENZIONE: Sabotaggio del generatore. Visibilità di emergenza ridotta al 15%!"
      ];
      const updated = {
        ...prev,
        sabotageActive: "LIGHTS" as const,
        sabotageTimer: 60,
        meetingLog: updatedLog
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleFixSabotage = () => {
    if (!room) return;
    setRoom(prev => {
      if (!prev) return null;
      const updatedLog = [
        ...prev.meetingLog,
        "🛠️ Allarme energetico risolto. I server secondari sono ripartiti."
      ];
      const updated = {
        ...prev,
        sabotageActive: "NONE" as const,
        meetingLog: updatedLog
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleStartGame = () => {
    if (!room) return;
    setRoom(prev => {
      if (!prev) return null;
      const updatedLog = [
        ...prev.meetingLog,
        "🟢 LOCKDOWN ATTIVATO. Tutte le porte si sono chiuse. Trovate il colpevole prima dello scadere del reattore!"
      ];
      const updated = {
        ...prev,
        isGameStarted: true,
        timeRemaining: 600,
        meetingLog: updatedLog
      };

      localStorage.setItem(`neon_room_${roomId.toUpperCase()}`, JSON.stringify(updated));
      return updated;
    });
  };

  const handleDirectArrest = (suspectId: string) => {
    setIsNotebookOpen(false);
    handleVoteCast(suspectId);
  };

  const handleRestartLobby = () => {
    if (room?.id) {
      localStorage.removeItem(`neon_room_${room.id.toUpperCase()}`);
    }
    setRoom(null);
    setIsJoined(false);
  };

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
                  className="bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-widest transition-all cursor-pointer"
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
                            <span className="text-[9px] text-slate-400 uppercase">{sus.role}</span>
                          </div>
                        </div>

                        {!isExiled ? (
                          <button
                            onClick={() => handleVoteCast(sus.id)}
                            className="bg-[#1e1b4b]/60 hover:bg-purple-900 hover:text-white border border-purple-500/30 rounded px-2.5 py-1 text-[10px] text-purple-300 font-extrabold uppercase tracking-wide transition-all cursor-pointer"
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
                    className="bg-black border border-purple-500/20 px-4 py-1.5 rounded uppercase hover:border-purple-400 text-purple-300 cursor-pointer text-xs font-mono font-bold"
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
                      <h2 className="text-2xl font-extrabold uppercase text-rose-400 tracking-wider">L'ASSASSINO È FUGGITO</h2>
                      <p className="text-xs text-slate-300 font-mono leading-relaxed">
                        Il tempo è scaduto o l'accusa formale era rivolta all'innocente. L'assassino vero è fuggito con il firmware centrale, lasciando Eclipse City nel caos più totale.
                      </p>
                    </>
                  )}

                  <div className="border-t border-purple-950 pt-4">
                    <button
                      onClick={handleRestartLobby}
                      className="bg-purple-600 hover:bg-purple-500 border border-purple-400 px-6 py-2.5 rounded-lg text-xs font-bold font-mono tracking-widest text-white uppercase cursor-pointer"
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
                          className="bg-purple-600 hover:bg-purple-500 border border-purple-400/80 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
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
                    <div className="bg-[#070311] border border-cyan-950/60 rounded-2xl p-4 h-[440px] flex flex-col justify-between font-mono">
                      <div>
                        <div className="flex items-center space-x-2 border-b border-cyan-950/60 pb-2 mb-3">
                          <Radio className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                          <span className="text-xs font-bold text-slate-200">MAINFRAME NEWSFEEDS</span>
                        </div>

                        {/* Event Feed logger list */}
                        <div className="space-y-2 text-[10px] text-cyan-300 overflow-y-auto max-h-[350px] pr-1 scrollbar-none leading-relaxed">
                          {room.meetingLog.map((log, index) => (
                            <div key={index} className="p-2.5 bg-cyan-950/15 border border-cyan-950/40 rounded-lg">
                              {log}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-cyan-950/60 pt-2 text-[9px] text-cyan-600">
                        STATUS: SYNCED // STATIC_LOCAL_MULTITAB_POOL
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
        <span>NEON SHADOWS Cyberpunk Deception Game // DIRECT CLIENT BROWSER GEMINI 3.5 DIALOGUES // ECLIPSE_W9_INC</span>
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
