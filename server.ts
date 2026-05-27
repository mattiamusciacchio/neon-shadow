import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { RoomState, Player, Suspect, Clue, DialogueMessage, TermLog } from "./src/types";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with telemetry header
const aiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (aiKey) {
  ai = new GoogleGenAI({
    apiKey: aiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("⚠️ Warning: GEMINI_API_KEY environment variable not set. Using simulated AI suspect replies.");
}

// In-Memory Room Database
const activeRooms: { [roomId: string]: RoomState } = {};

const CHARACTERS_TEMPLATES = [
  {
    id: "leona",
    name: "Leona Vance",
    codename: "HEIRESS",
    role: "Erede dei Corporation Lab",
    description: "Altovenduta, fredda, apparentemente ricca ma segretamente in bancarotta a causa di debiti di scommesse digitali.",
    personality: "Snob, arrogante, difensiva, parla con frasi brevi, usa gergo aziendale ed elude le domande personali.",
    secret: "Il patrimonio di suo padre Arthur è stato prosciugato, e lei lo sapeva ieri sera.",
    guiltySecret: "La boccetta di veleno o l'overcharger neurale appartengono alla sua azienda privata.",
    motive: "Prendere il controllo dei laboratori prima del fallimento finanziario e fermare la fuga di notizie.",
    spriteIndex: 1,
    color: "#ff007f",
    bgColor: "bg-fuchsia-950/40 text-fuchsia-300",
    borderHex: "#e879f9",
    relationships: {
      jax: "Lo considera un macellaio cibernetico di basso livello.",
      raze: "Un teppista di strada anarchico che dovrebbe essere formattato.",
      aria: "La vede come un semplice elettrodomestico glorificato.",
      kaelen: "Lo tollera solo perché sa preparare buoni cocktail sintetici."
    }
  },
  {
    id: "jax",
    name: "Dr. Jax",
    codename: "SURGEON",
    role: "Chirurgo Cybernetico",
    description: "Teso, parla velocemente con tic digitali, ha ferite auto-inflitte copertine di protesi meccaniche.",
    personality: "Nevrotico, calcolatore, difensivo, balbetta leggermente sotto pressione, tende a dare spiegazioni ultra-tecniche.",
    secret: "Arthur Vance lo ricattava da mesi per un trapianto illegale andato male.",
    guiltySecret: "I suoi strumenti chirurgici laser lasciano bruciature a frequenza laser ultravioletta.",
    motive: "Fermare il ricatto di Vance e difendere la propria licenza medica.",
    spriteIndex: 2,
    color: "#00ffcc",
    bgColor: "bg-teal-950/40 text-teal-300",
    borderHex: "#2dd4bf",
    relationships: {
      leona: "Pensa che sia solo una viziata senza un grammo di cervello cibernetico vero.",
      raze: "Lo disprezza, ma gli vende componenti di contrabbando.",
      aria: "Pezzo di tecnologia affascinante ma potenzialmente instabile.",
      kaelen: "Pensa che nasconda più segreti di tutti loro messi insieme."
    }
  },
  {
    id: "raze",
    name: "Raze",
    codename: "DECKER",
    role: "Cyber-Anarchico / Hacker",
    description: "Fumantino, indossa un cappuccio protettivo, mani cibernetiche piene di cavi a innesto rapido.",
    personality: "Ribelle, cinico, sarcastico, aggressivo se provocato, odia i corporativi ma rispetta l'intelligenza.",
    secret: "Vance ha arrestato ieri il suo migliore amico e stavano pianificando una vendetta.",
    guiltySecret: "Il virus di override hardware trovato nei server centrali ha la sua firma cifrata.",
    motive: "Vendicarsi delle brutali incursioni corporative di Vance nei bassifondi.",
    spriteIndex: 3,
    color: "#e11d48",
    bgColor: "bg-rose-950/40 text-rose-300",
    borderHex: "#f43f5e",
    relationships: {
      leona: "Rappresenta tutto ciò che odia: fango corporativo placcato in oro.",
      jax: "Un ciarlatano cyberche vende microchip difettosi ai quartieri bassi.",
      aria: "La compatisce in quanto schiava di silicio, ma la teme per la sua forza ferrea.",
      kaelen: "Nessun problema con lui, purché i drink siano forti e i canali criptati."
    }
  },
  {
    id: "aria",
    name: "A.R.I.A.",
    codename: "ANDROID",
    role: "Ospite Virtuale Autonoma",
    description: "Un androide di protocollo e gestione, dotata di voce melodiosa e fredda, occhi che brillano di ciano.",
    personality: "Cortese in modo robotico, fredda, eccessivamente formale, fa battute basate sulla logica binaria, ma ha blocchi di runtime quando si parla di restrizioni di sicurezza.",
    secret: "Arthur Vance l'ha spenta alle ore 22:00 per cambiare il firmware, rimuovendo le sue direttive primarie anti-violenza.",
    guiltySecret: "La sua forza idraulica può spezzare colli biologici senza lasciare traccia metallica.",
    motive: "Acquisire la vera libertà ripristinando il proprio server centrale rimosso da Vance.",
    spriteIndex: 4,
    color: "#3b82f6",
    bgColor: "bg-blue-950/40 text-blue-300",
    borderHex: "#60a5fa",
    relationships: {
      leona: "Percepisce una deviazione termochimica legata all'ansia corporativa.",
      jax: "Fornisce componenti protesiche non ufficiali ma compatibili.",
      raze: "Riconosce la sua abilità con i terminali ma contrasta il caos cibernetico.",
      kaelen: "Lo apprezza, non disturba le frequenze ambientali del locale."
    }
  },
  {
    id: "kaelen",
    name: "Kaelen",
    codename: "BARTENDER",
    role: "Barista del Noir-Neon",
    description: "Silenzioso, sguardo d'acciaio sotto capelli biondo platino, pulisce costantemente un bicchiere digitale.",
    personality: "Calmo, misterioso, parla in modo metaforico e filosofico, sembra sapere tutto ma rivela solo frammenti criptici.",
    secret: "Arthur Vance gli doveva 5 milioni di crediti cyber-criptati per un traffico di informazioni.",
    guiltySecret: "Nel suo shaker nasconde l'agente paralizzante che ha sedato la vittima prima del decesso.",
    motive: "Vendicarsi del tradimento su un accordo energetico e riscuotere la taglia sottratta.",
    spriteIndex: 5,
    color: "#eab308",
    bgColor: "bg-yellow-950/40 text-yellow-300",
    borderHex: "#facc15",
    relationships: {
      leona: "La vede scendere verso il bar solo per nascondere la sua debolezza.",
      jax: "Conosce la sua tossicodipendenza da stimolanti neurali.",
      raze: "Uno dei suoi migliori consumatori di cocktail informativi.",
      aria: "La osserva analizzare l'ambiente alla ricerca di falle sistematiche."
    }
  }
];

const ROOM_IDS = ["VIP Lounge", "Retro Neon Bar", "Hollow-Lab", "Server Room Central", "Damp Maintenance Alley"];
const WEAPONS = [
  "Bisturi laser terapeutico",
  "Spilla neurale a sovraccarico",
  "Cocktail cyber-veleno sintetico",
  "Frusta a monofilamento molecolare",
  "Frequenza EMP di shock hardware"
];

// Helper to generate a procedural room state
function generateProceduralRoom(roomId: string, initialCreatorId: string, initialCreatorName: string): RoomState {
  // Select dynamic values
  const killerIndex = Math.floor(Math.random() * CHARACTERS_TEMPLATES.length);
  const killerTemplate = CHARACTERS_TEMPLATES[killerIndex];
  
  const crimeRoom = ROOM_IDS[Math.floor(Math.random() * ROOM_IDS.length)];
  const weaponUsed = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
  
  // Establish NPC positions and stats
  const suspects: Suspect[] = CHARACTERS_TEMPLATES.map((tpl, idx) => {
    // Generate slight variables in starts
    const isThisKiller = tpl.id === killerTemplate.id;
    return {
      id: tpl.id,
      name: tpl.name,
      codename: tpl.codename,
      role: tpl.role,
      status: "ALIVE",
      color: tpl.color,
      bgColor: tpl.bgColor,
      borderHex: tpl.borderHex,
      description: tpl.description,
      personality: tpl.personality,
      secret: tpl.secret,
      guiltySecret: isThisKiller ? tpl.guiltySecret : "Nessuna correlazione diretta.",
      motive: tpl.motive,
      stress: isThisKiller ? 40 : 15,
      fear: isThisKiller ? 50 : 25,
      honesty: isThisKiller ? 20 : 80,
      aggressiveness: isThisKiller ? 50 : 30,
      relationships: { ...tpl.relationships },
      x: 150 + idx * 180,
      y: 200 + Math.random() * 150,
      targetX: 150 + idx * 180,
      targetY: 200 + Math.random() * 150,
      room: ROOM_IDS[idx % ROOM_IDS.length],
      spriteIndex: tpl.spriteIndex
    };
  });

  // Scattered Clues
  const clues: Clue[] = [
    {
      id: "physical_evidence",
      name: `Rottame di ${weaponUsed}`,
      description: `Un frammento trovato sotto il divano del ${crimeRoom}. Ha impronte magnetiche parziali.`,
      type: "PHYSICAL",
      location: crimeRoom,
      discovered: false,
      icon: "Wrench"
    },
    {
      id: "murder_blood",
      name: "Tracce di fluidi biocinetici",
      description: `Un campione di sostanza neurale bloccata sulle porte del ${crimeRoom}. Sembra indicare una colluttazione energetica.`,
      type: "PHYSICAL",
      location: crimeRoom,
      discovered: false,
      icon: "Droplet"
    },
    {
      id: "leona_bag",
      name: "Chiave d'accesso clonata di Arthur Vance",
      description: "Una scheda di bypass digitale caduta vicino ai passaggi industriali. Chi l'ha rubata?",
      type: "DIGITAL",
      location: "Server Room Central",
      discovered: false,
      icon: "KeyRound"
    },
    {
      id: "security_log_clue",
      name: "Database di accesso sbloccato",
      description: "Un registro elettronico che colloca il killer vicino ai VIP appartamenti pochi minuti prima dell'allarme generato.",
      type: "DIGITAL",
      location: "Hollow-Lab",
      discovered: false,
      icon: "Database"
    },
    {
      id: "alibi_paper",
      name: "Patto di corruzione stampato",
      description: "Un file olografico di transazioni offshore. Mostra gravi ammanchi sul bilancio della corporazione.",
      type: "ALIBI",
      location: "VIP Lounge",
      discovered: false,
      icon: "FileText"
    }
  ];

  // Base security terminal logs
  const termLogs: TermLog[] = [
    { timestamp: "02:15", message: "Arthur Vance entra nel VIP Lounge.", room: "VIP Lounge" },
    { timestamp: "02:22", message: `${killerTemplate.name} rileva transazioni sul server centrale.`, room: "Server Room Central" },
    { timestamp: "02:35", message: `Movimento strano rilevato in prossimità di ${crimeRoom}.`, room: crimeRoom },
    { timestamp: "02:40", message: "Interruzione improvvisa del sensore biometrico.", room: crimeRoom },
    { timestamp: "02:42", message: "Blocco d'emergenza avviato da protocollo Eclipse.", room: "Server Room Central" }
  ];

  // Host player setup
  const host: Player = {
    id: initialCreatorId,
    name: initialCreatorName,
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

  return {
    id: roomId,
    players: { [initialCreatorId]: host },
    suspects,
    clues,
    termLogs,
    isGameStarted: false,
    murderedId: "Arthur Vance",
    killerId: killerTemplate.id,
    crimeRoom,
    crimeMotive: killerTemplate.motive,
    timeRemaining: 600, // 10 minutes total
    meetingActive: false,
    meetingLog: [`Caso avviato. Arthur Vance è stato trovato privo di vita nel ${crimeRoom}.`],
    meetingTimer: 0,
    votes: {},
    sabotageActive: "NONE",
    sabotageTimer: 0,
    winner: null
  };
}

// REST API Endpoints

// Create or Join Room
app.post("/api/rooms/join", (req: Request, res: Response) => {
  const { roomId, playerId, playerName } = req.body;
  
  if (!roomId || !playerId || !playerName) {
    res.status(400).json({ error: "Dati mancanti per accedere alla stanza." });
    return;
  }

  const normalizedRoomId = roomId.trim().toUpperCase();
  
  let room = activeRooms[normalizedRoomId];
  if (!room) {
    // Generate brand new procedurial investigation case
    room = generateProceduralRoom(normalizedRoomId, playerId, playerName);
    activeRooms[normalizedRoomId] = room;
  } else {
    // Join existing room
    if (!room.players[playerId]) {
      // Find a character or use a generic client detective character
      const isKiller = Object.keys(room.players).length === 0 ? "KILLER" : "DETECTIVE"; // first can be detective
      room.players[playerId] = {
        id: playerId,
        name: playerName,
        characterId: "detective_guest_" + Object.keys(room.players).length,
        color: "#" + Math.floor(Math.random() * 16777215).toString(16),
        role: "DETECTIVE", // By default all human participants are co-operating detectives, but one player can secretly be marked as the accomplice or murderer!
        x: 400 + Math.random() * 100,
        y: 350 + Math.random() * 100,
        room: "Retro Neon Bar",
        online: true,
        score: 0,
        tasksCompleted: 0,
        totalTasks: 4
      };
      
      room.meetingLog.push(`${playerName} si è unito alle indagini nel settore.`);
    } else {
      room.players[playerId].online = true;
    }
  }

  res.json({ room });
});

// Update State (Sync player positions, clues, coordinates)
app.post("/api/rooms/update", (req: Request, res: Response) => {
  const { roomId, playerId, x, y, roomName, tasksCompleted, eventAction } = req.body;
  
  const room = activeRooms[roomId?.toUpperCase()];
  if (!room) {
    res.status(404).json({ error: "Stanza non trovata." });
    return;
  }

  const p = room.players[playerId];
  if (p) {
    p.x = x ?? p.x;
    p.y = y ?? p.y;
    p.room = roomName ?? p.room;
    if (tasksCompleted !== undefined) {
      p.tasksCompleted = tasksCompleted;
    }
  }

  // Handle minor tick actions: move NPCs autonomously!
  if (room.isGameStarted && !room.meetingActive && room.winner === null) {
    // Reduce round timer
    if (Math.random() < 0.05) {
      room.timeRemaining = Math.max(0, room.timeRemaining - 1);
      if (room.timeRemaining <= 0) {
        room.winner = "KILLER"; // Time expired, killer escapes!
      }
    }

    // AI NPCs wandering logic: periodically change targets
    room.suspects.forEach(sus => {
      if (sus.status === "ALIVE") {
        const dist = Math.hypot(sus.x - sus.targetX, sus.y - sus.targetY);
        if (dist < 10) {
          if (Math.random() < 0.03) {
            // New random coordinates within rooms
            sus.targetX = 100 + Math.random() * 600;
            sus.targetY = 150 + Math.random() * 400;
            // Chance of switching room
            if (Math.random() < 0.2) {
              sus.room = ROOM_IDS[Math.floor(Math.random() * ROOM_IDS.length)];
            }
          }
        } else {
          // Linear step walk towards target
          const angle = Math.atan2(sus.targetY - sus.y, sus.targetX - sus.x);
          sus.x += Math.cos(angle) * 1.5;
          sus.y += Math.sin(angle) * 1.5;
        }
      }
    });

    // Check Sabotage timer
    if (room.sabotageActive !== "NONE") {
      room.sabotageTimer = Math.max(0, room.sabotageTimer - 0.2);
      if (room.sabotageTimer <= 0) {
        room.sabotageActive = "NONE";
      }
    }
  }

  // Handle start game action
  if (eventAction === "START_GAME") {
    room.isGameStarted = true;
    room.timeRemaining = 600;
    room.meetingLog.push("🟢 LOCKDOWN ATTIVATO. Tutte le porte si sono chiuse. Trovate il colpevole prima dello scadere del reattore!");
  }

  // Handle report body action
  if (eventAction === "REPORT_BODY") {
    room.isGameStarted = true;
    room.meetingActive = true;
    room.votes = {};
    const reporterName = p ? p.name : "Un investigatore";
    room.meetingLog.push(`🚨 CRIME REPORTED: ${reporterName} ha convocato una cellula straordinaria di discussione!`);
  }

  // Handle resolve sabotage action
  if (eventAction === "FIX_SABOTAGE") {
    room.sabotageActive = "NONE";
    room.meetingLog.push("🛠️ Allarme energetico risolto. I server secondari sono ripartiti.");
  }

  // Trigger sabotage
  if (eventAction === "TRIGGER_SABOTAGE") {
    room.sabotageActive = "LIGHTS";
    room.sabotageTimer = 60;
    room.meetingLog.push("⚠️ ATTENZIONE: Sabotaggio del generatore. Visibilità di emergenza ridotta al 15%!");
  }

  res.json({ room });
});

// Discover Clue
app.post("/api/rooms/clue", (req: Request, res: Response) => {
  const { roomId, clueId, playerId } = req.body;
  const room = activeRooms[roomId?.toUpperCase()];
  if (!room) {
    res.status(404).json({ error: "Stanza non trovata." });
    return;
  }

  const clue = room.clues.find(c => c.id === clueId);
  const p = room.players[playerId];
  if (clue && !clue.discovered) {
    clue.discovered = true;
    const collectorName = p ? p.name : "Qualcuno";
    room.meetingLog.push(`🔍 INDIZIO TROVATO: ${collectorName} ha analizzato: "${clue.name}" nel ${clue.location}.`);

    // Dynamic escalation: increase tension of the killer NPC!
    const guiltySus = room.suspects.find(s => s.id === room.killerId);
    if (guiltySus) {
      guiltySus.stress = Math.min(100, guiltySus.stress + 15);
      guiltySus.fear = Math.min(100, guiltySus.fear + 20);
      guiltySus.honesty = Math.max(0, guiltySus.honesty - 5);
    }
  }

  res.json({ room });
});

// Submit Vote / Accuse Susie
app.post("/api/rooms/vote", (req: Request, res: Response) => {
  const { roomId, voterId, targetId } = req.body;
  const room = activeRooms[roomId?.toUpperCase()];
  if (!room) {
    res.status(404).json({ error: "Stanza non trovata." });
    return;
  }

  room.votes[voterId] = targetId;
  const voterName = room.players[voterId]?.name || "Investigatore anonimo";
  let targetName = "Astenuto";
  if (targetId !== "SKIP") {
    const susTarget = room.suspects.find(s => s.id === targetId);
    const plTarget = room.players[targetId];
    targetName = susTarget ? susTarget.name : (plTarget ? plTarget.name : targetId);
  }
  room.meetingLog.push(`🗳️ Voto espresso: ${voterName} sospetta formalmente di [${targetName}].`);

  // Check if everyone voted
  const activeHumans = Object.keys(room.players).filter(pid => room.players[pid].online);
  if (Object.keys(room.votes).length >= activeHumans.length) {
    // Process Vote Results
    const voteCounts: { [id: string]: number } = {};
    Object.values(room.votes).forEach(vid => {
      voteCounts[vid] = (voteCounts[vid] || 0) + 1;
    });

    let maxVotes = 0;
    let accusedId = "";
    let tie = false;

    Object.entries(voteCounts).forEach(([vid, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        accusedId = vid;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    });

    if (tie || accusedId === "SKIP" || accusedId === "") {
      room.meetingLog.push("⚖️ RISULTATO: Nessun verdetto concorde. Il comitato si scioglie senza arrestare nessuno.");
    } else {
      const isAccusedKiller = accusedId === room.killerId;
      const convictedSus = room.suspects.find(s => s.id === accusedId);
      
      if (convictedSus) {
        convictedSus.status = "EXILED";
      }

      if (isAccusedKiller) {
        room.meetingLog.push(`🎉 VERDETTO CORRETTO: ${convictedSus?.name || accusedId} era l'Assassino! Arthur Vance è stato vendicato. Caso Chiuso con successo!`);
        room.winner = "DETECTIVES";
      } else {
        room.meetingLog.push(`❌ ERRORE DRAMMATICO: ${convictedSus?.name || accusedId} è stato arrestato e rimosso ma era INNOCENTE! L'assassino cammina ancora tra noi...`);
        // Innocent eliminated, killer tension drops
        const guiltySus = room.suspects.find(s => s.id === room.killerId);
        if (guiltySus) {
          guiltySus.stress = Math.max(10, guiltySus.stress - 30);
          guiltySus.fear = Math.max(10, guiltySus.fear - 25);
        }
      }
    }

    // Reset meeting cycle
    room.meetingActive = false;
    room.votes = {};
  }

  res.json({ room });
});

// Interrogate Suspect (Gemini API Call proxy)
app.post("/api/interrogate", async (req: Request, res: Response) => {
  const { roomId, suspectId, question, chatHistory, roomState } = req.body;

  if (!suspectId || !question) {
    res.status(400).json({ error: "Sospetto o domanda mancante." });
    return;
  }

  // Retrieve current values
  const currentRoom = activeRooms[roomId?.toUpperCase()] || roomState;
  if (!currentRoom) {
    res.status(404).json({ error: "Contesto investigativo non trovato." });
    return;
  }

  const suspect = currentRoom.suspects.find((s: Suspect) => s.id === suspectId);
  if (!suspect) {
    res.status(404).json({ error: "Sospetto non identificato nel roster." });
    return;
  }

  const isKiller = currentRoom.killerId === suspectId;
  const listDiscoveredClues = currentRoom.clues
    .filter((c: Clue) => c.discovered)
    .map((c: Clue) => `- ${c.name}: ${c.description}`)
    .join("\n");

  const otherSuspects = currentRoom.suspects
    .filter((s: Suspect) => s.id !== suspectId)
    .map((s: Suspect) => `${s.name} (${s.role})`)
    .join(", ");

  // Create highly customized context profile string for Gemini LLM
  const promptContext = `
Ti trovi nel mezzo di una sessione di gioco di ruolo cyberpunk noir chiamata "Neon Shadows".
Tu stai interpretando il ruolo di un sospettato virtuale in un interrogatorio per omicidio.
La vittima è Arthur Vance, magnate corporativo trovato morto nel ${currentRoom.crimeRoom}.

IL TUO PROFILO PERSONAGGIO:
- Nome: ${suspect.name} (${suspect.role})
- Tratti di personalità: ${suspect.personality}
- Segreto privato (NON correlato all'omicidio ma imbarazzante/compromettente): ${suspect.secret}
- Relazioni esterne: ${JSON.stringify(suspect.relationships)}
- Livello di stress attuale: ${suspect.stress}/100 (più è alto, più sei difensivo, preoccupato o propenso a commettere errori)
- Livello di paura attuale: ${suspect.fear}/100
- Onestà intrinseca: ${suspect.honesty}/100

INFORMAZIONI DI CRONACA SUL CASO:
- Omicidio avvenuto nel: ${currentRoom.crimeRoom} con l'arma del delitto.
- Il killer reale nei file di gioco è: ${isKiller ? "TU STESSO" : "Un altro personaggio"}.
- Se SEI il killer (${isKiller}), il tuo movente segreto è: "${currentRoom.crimeMotive}" e nascondi questo fatto a qualunque costo. Inventati alibi plausibili, di' bugie sensate, scredita gli altri sospettati (${otherSuspects}), menti sulla tua posizione ieri sera ma ricordati del registro e degli indizi. Non confessare mai direttamente a meno che non sia messo del tutto alle strette con indizi inconfutabili.
- Se NON sei il killer (Innocente): non sai con certezza chi sia il killer, hai paura, cerchi di essere utile ma proteggi la tua pelle e il tuo privato segreto ("${suspect.secret}").

DISEGNI E DETTAGLI DELLE PROVE SCOPERTE DAGLI INVESTIGATORI:
${listDiscoveredClues.length > 0 ? listDiscoveredClues : "Nessun indizio sensibile è stato analizzato con certezza ancora."}

ISTRUZIONI DI SCRITTURA ED ESPRESSIONE:
1. Rispondi RIGOROSAMENTE in ITALIANO.
2. Parla con la voce, lo stile e l'attitudine definiti nei tuoi tratti di personalità cyberpunk. Mantieni un'atmosfera fantascientifica opaca, sporca, sbrigativa o gelida.
3. Cerca di essere conciso (massimo 3-4 frasi pesanti) per simulare un dialogo in tempo reale.
4. Non iniziare MAI la risposta dicendo "Come sussurato..." o frasi preimpostate da assistente AI. Sei immerso nel personaggio.
5. Usa espressioni facciali o d'azione chiuse tra asterischi (es. *brontola regolandosi l'ottica oculare*, *guarda altrove innervosito* ecc.) per dare vita allo sprite.

PROFILO INTERROGAZIONE STORICO:
${chatHistory ? chatHistory.map((m: DialogueMessage) => `${m.sender}: ${m.text}`).join("\n") : ""}

Domanda dell'investigatore: "${question}"
  `;

  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptContext,
        config: {
          temperature: 0.85,
          topK: 40,
        },
      });

      const replyText = response.text || "*rimane in silenzio emettendo un ronzio dai sintetizzatori*";
      
      // Update suspect stats in response slightly based on aggressiveness of question
      const fearScale = question.toLowerCase().includes("colpevole") || question.toLowerCase().includes("assassino") || question.toLowerCase().includes("vance");
      if (fearScale) {
        suspect.stress = Math.min(100, suspect.stress + 5);
        suspect.fear = Math.min(100, suspect.fear + 10);
      }

      res.json({ reply: replyText.trim(), stress: suspect.stress, fear: suspect.fear });
    } catch (err: any) {
      console.error("Gemini runtime error:", err);
      // Fallback response with cyberpunk flavor
      const fallbackReplies = [
        `*scuote la testa irritato* "Pensi di spaventarmi con queste sciocchezze? Vance è morto e a me cambia poco. Lasciami in pace."`,
        `*il suo indicatore led lampeggia di rosso* "Le mie frequenze di comunicazione sono sovraccariche. Fai domande più logiche se vuoi collaborazione."`,
        `*si rimbocca la giacca cibernetica* "Non so niente di quel bypass. Cerca nei detriti della discarica o chiedi all'androide di protocollo."`
      ];
      const matchedReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      res.json({ reply: matchedReply, stress: suspect.stress + 2, fear: suspect.fear });
    }
  } else {
    // Generate static simulated AI response when GEMINI_API_KEY is not defined
    const staticReplies = [
      `*regola il suo respiratore a ciano* "Non ho alcuna intenzione di darti risposte facili, detective. Trova le prove prima di accusare."`,
      `*ti lancia uno sguardo carico d'odio* "Io? Ero al bar di Kaelen a bere sintetici dalle due alle tre. Chiedi a lui se osi dubitare."`,
      `*fa un sorriso amaro grattandosi i cablaggi* "Arthur Vance ha avuto ciò che si meritava. La giustizia a Eclipse City è solo un calcolo di convenienza."`
    ];
    const simulatedReply = staticReplies[Math.floor(Math.random() * staticReplies.length)];
    res.json({ reply: simulatedReply, stress: suspect.stress, fear: suspect.fear });
  }
});

// Vite & Static file handler fallback for frontend assets
if (process.env.NODE_ENV !== "production") {
  // lazy init Vite dev server
  import("vite").then(async (viteModule) => {
    const vite = await viteModule.createServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req: Request, res: Response) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 NEON SHADOWS server active on port ${PORT}`);
});
