import { RoomState, Player, Suspect, Clue, TermLog, DialogueMessage } from "../types";

export const ROOM_IDS = ["VIP Lounge", "Retro Neon Bar", "Hollow-Lab", "Server Room Central", "Damp Maintenance Alley"];

export const WEAPONS = [
  "Bisturi laser terapeutico",
  "Spilla neurale a sovraccarico",
  "Cocktail cyber-veleno sintetico",
  "Frusta a monofilamento molecolare",
  "Frequenza EMP di shock hardware"
];

export const CHARACTERS_TEMPLATES = [
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

// Generate an initial random investigation
export function generateProceduralRoom(roomId: string, initialCreatorId: string, initialCreatorName: string): RoomState {
  const killerIndex = Math.floor(Math.random() * CHARACTERS_TEMPLATES.length);
  const killerTemplate = CHARACTERS_TEMPLATES[killerIndex];
  
  const crimeRoom = ROOM_IDS[Math.floor(Math.random() * ROOM_IDS.length)];
  const weaponUsed = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
  
  const suspects: Suspect[] = CHARACTERS_TEMPLATES.map((tpl, idx) => {
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
      x: 150 + idx * 110,
      y: 180 + Math.random() * 120,
      targetX: 150 + idx * 110,
      targetY: 180 + Math.random() * 120,
      room: ROOM_IDS[idx % ROOM_IDS.length],
      spriteIndex: tpl.spriteIndex
    };
  });

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

  const termLogs: TermLog[] = [
    { timestamp: "02:15", message: "Arthur Vance entra nel VIP Lounge.", room: "VIP Lounge" },
    { timestamp: "02:22", message: `${killerTemplate.name} rileva transazioni sul server centrale.`, room: "Server Room Central" },
    { timestamp: "02:35", message: `Movimento strano rilevato in prossimità di ${crimeRoom}.`, room: crimeRoom },
    { timestamp: "02:40", message: "Interruzione improvvisa del sensore biometrico.", room: crimeRoom },
    { timestamp: "02:42", message: "Blocco d'emergenza avviato da protocollo Eclipse.", room: "Server Room Central" }
  ];

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
    timeRemaining: 600,
    meetingActive: false,
    meetingLog: [`Caso avviato. Arthur Vance è stato trovato privo di vita nel ${crimeRoom}.`],
    meetingTimer: 0,
    votes: {},
    sabotageActive: "NONE",
    sabotageTimer: 0,
    winner: null
  };
}

// REST Client-Side Direct Fetch Call Proxy for Gemini
export async function interrogateSuspectDirect(
  suspectId: string,
  question: string,
  chatHistory: DialogueMessage[],
  room: RoomState,
  apiKey: string
): Promise<{ reply: string; stress: number; fear: number }> {
  const suspect = room.suspects.find(s => s.id === suspectId);
  if (!suspect) {
    throw new Error("Sospetto non trovato nel roster.");
  }

  const isKiller = room.killerId === suspectId;
  const listDiscoveredClues = room.clues
    .filter(c => c.discovered)
    .map(c => `- ${c.name}: ${c.description}`)
    .join("\n");

  const otherSuspects = room.suspects
    .filter(s => s.id !== suspectId)
    .map(s => `${s.name} (${s.role})`)
    .join(", ");

  const promptContext = `
Ti trovi nel mezzo di una sessione di gioco di ruolo cyberpunk noir chiamata "Neon Shadows".
Tu stai interpretando il ruolo di un sospettato virtuale in un interrogatorio per omicidio.
La vittima è Arthur Vance, magnate corporativo trovato morto nel ${room.crimeRoom}.

IL TUO PROFILO PERSONAGGIO:
- Nome: ${suspect.name} (${suspect.role})
- Tratti di personalità: ${suspect.personality}
- Segreto privato (NON correlato all'omicidio ma imbarazzante/compromettente): ${suspect.secret}
- Relazioni esterne: ${JSON.stringify(suspect.relationships)}
- Livello di stress attuale: ${suspect.stress}/100 (più è alto, più sei difensivo, preoccupato o propenso a commettere errori)
- Livello di paura attuale: ${suspect.fear}/100
- Onestà intrinseca: ${suspect.honesty}/100

INFORMAZIONI DI CRONACA SUL CASO:
- Omicidio avvenuto nel: ${room.crimeRoom} con l'arma del delitto.
- Il killer reale nei file di gioco è: ${isKiller ? "TU STESSO" : "Un altro personaggio"}.
- Se SEI il killer (${isKiller}), il tuo movente segreto è: "${room.crimeMotive}" e nascondi questo fatto a qualunque costo. Inventati alibi plausibili, di' bugie sensate, scredita gli altri sospettati (${otherSuspects}), menti sulla tua posizione ieri sera ma ricordati del registro e degli indizi. Non confessare mai direttamente a meno che non sia messo del tutto alle strette con indizi inconfutabili.
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
${chatHistory ? chatHistory.map(m => `${m.sender}: ${m.text}`).join("\n") : ""}

Domanda dell'investigatore: "${question}"
`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: promptContext
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.85,
            topK: 40
          }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "*rimane in silenzio emettendo un ronzio dai sintetizzatori*";

    let nStress = suspect.stress;
    let nFear = suspect.fear;
    const fearScale = question.toLowerCase().includes("colpevole") || question.toLowerCase().includes("assassino") || question.toLowerCase().includes("vance");
    if (fearScale) {
      nStress = Math.min(100, suspect.stress + 5);
      nFear = Math.min(100, suspect.fear + 10);
    }

    return {
      reply: replyText.trim(),
      stress: nStress,
      fear: nFear
    };
  } catch (err) {
    console.warn("Direct connection to Gemini API failed, using fallback:", err);
    throw err;
  }
}
