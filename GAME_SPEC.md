# 🎮 NEON SHADOWS - Game Specification

## CONCEPT GENERALE

**Titolo:** NEON SHADOWS  
**Genere:** Mystery Investigation / Deduction / Multiplayer Social Deduction  
**Piattaforma:** Web Browser (HTML5 Canvas + React)  
**Target:** Desktop & Tablet

---

## AMBIENTAZIONE

Una gigantesca città cyberpunk futuristica chiamata **"Eclipse City"**, costruita sopra diversi livelli verticali. La città è controllata da corporazioni corrotte, criminalità organizzata e intelligenze artificiali fuori controllo.

Il giocatore è un **investigatore privato** intrappolato in un complesso isolato dopo un misterioso omicidio. Tutti gli NPC presenti potrebbero essere:
- **Innocenti**
- **Complici**
- **Manipolatori**
- **Assassini**
- **Testimoni falsi**

### Generazione Procedurale

Ogni partita genera:
- ✅ Un assassino diverso
- ✅ Relazioni differenti tra NPC
- ✅ Prove differenti posizionate casualmente
- ✅ Dialoghi variabili
- ✅ Eventi casuali dinamici

### Differenziazione da Among Us

Il gioco **NON copia** Among Us:
- ❌ Niente astronauti / tema spaziale
- ❌ Niente task identici
- ❌ Niente stile cartoon semplice
- ❌ Niente gameplay copia/incolla

Si concentra invece su:
- ✅ **Investigazione profonda**
- ✅ **Psicologia comportamentale**
- ✅ **Dialoghi AI realistici**
- ✅ **Tensione narrativa**
- ✅ **Bugie dinamiche**
- ✅ **Sospetto realistico**

---

## STILE GRAFICO

### Rendering
- **Tipo:** 2D top-down isometrico / pianta
- **Engine:** HTML5 Canvas + React
- **Atmosfera:** Cyberpunk noir con luci neon
- **Effetti:** Ombre dinamiche, pioggia, particelle

### Color Palette (Neon Cyberpunk)
```
Primario:    #FF00FF (Magenta Neon)
Secondario:  #00FFFF (Ciano Neon)
Accento:     #FF0033 (Rosso Scuro)
Neutri:      #0A0E27 (Nero profondo)
             #1A1F3A (Blu scuro)
             #2D3561 (Blu-grigio)
Background:  #000000 (Nero assoluto)
Testo:       #E0E0FF (Bianco-blu)
```

### Design Personaggi
- Sprite 2D animati (64x64 px base)
- Espressioni facciali dinamiche
- Variazioni abbigliamento corporativo
- Identità visiva unica per ogni NPC
- Animazioni fluide ma semplici

### Interfaccia
- Minimal, futuristica, trasparente
- Glassmorphism con effetti neon
- Testo monospaziato cyberpunk
- HUD minimalista

---

## GAMEPLAY LOOP

### Azioni Principali

**1. INVESTIGAZIONE**
- Esplorazione mappa interconnessa
- Raccolta prove fisiche e digitali
- Osservazione ambienti
- Raccolta informazioni

**2. INTERROGATORI**
- Dialogo con NPC
- Domande mirate
- Osservazione linguaggio corporeo
- Pressione psicologica

**3. DEDUZIONE**
- Confronto testimonianze
- Timeline ricostruzione
- Contraddizioni rilevamento
- Teoria costruzione

**4. ACCUSA**
- Indizio finale richiesto
- Conseguenze multiple
- Diversi finali

### Meccaniche Primarie

#### Taccuino Investigativo
- Timeline interattiva
- Archivio prove
- Profili NPC
- Mappa relazioni
- Note personali

#### Telecamere & Monitor
- Visualizzazione spostamenti NPC
- Replay momenti chiave
- Prove video
- Controllo accessi

#### Analisi File Digitali
- Email aziendali
- Messaggi criptati
- Log di sistema
- Transazioni finanziarie

---

## SISTEMA NPC AI

### Profilo NPC Completo

Ogni NPC possiede:

```javascript
{
  id: string,
  nome: string,
  ruolo: string, // Es: "Tecnico", "Manager", "Guardia"
  personalita: {
    simpatia: 0-100,
    aggressivita: 0-100,
    intelligenza: 0-100,
    furbizia: 0-100,
    nervosismo: 0-100
  },
  memoria: [
    {
      evento: string,
      ora: timestamp,
      dettagli: string
    }
  ],
  relazioni: {
    [npcId]: {
      tipo: "amico" | "nemico" | "collega" | "ignoto",
      intensita: 0-100,
      segreto_condiviso: boolean
    }
  },
  segreti: [
    {
      tipo: string, // "relazione", "debito", "crimine", "ricatto"
      gravita: 0-100,
      persone_coinvolte: [npcId]
    }
  ],
  stato_psicologico: {
    stress: 0-100,
    paura: 0-100,
    colpa: 0-100,
    sospetto_verso_giocatore: 0-100
  },
  routine: [
    {
      ora_inizio: time,
      ora_fine: time,
      luogo: location,
      azione: string,
      probabilita_deviazione: 0-100
    }
  ],
  alibi: {
    testimone: npcId | null,
    video: boolean,
    prove: string[]
  }
}
```

### Comportamento Dinamico

Gli NPC reagiscono in tempo reale:

- **Accusa ripetuta** → Diventano ostili, riducono cooperazione
- **Prove trovate** → Cambiano atteggiamento, possono confessare
- **Paura rilevata** → Mentono più frequentemente
- **Protezione alleato** → Forniscono alibi falsi
- **Pressione psicologica** → Confusione, errori nella storia
- **Morte NPC (in modalità avanzata)** → Paranoia diffusa

### Movimento & Routine

- Pathfinding A* per movimento naturale
- Routine giornaliera dinamica
- Possibilità di deviazione (per sporcare le prove)
- Interazione casuale tra NPC
- Comunicazione silenziosa (segni, sguardi)

---

## SISTEMA MENZOGNE & TENSIONE

### Tipologie di Menzogne

Gli NPC **NON dicono sempre la verità**:

1. **Bugia Diretta** - Negazione completa
2. **Omissione** - Non dire dettagli importanti
3. **Confusione** - Mescolare tempi e fatti
4. **Accusazione Falsa** - Incolpare innocenti
5. **Esagerazione** - Amplificare dettagli minori
6. **Silenzio** - Rifiuto di rispondere

### Sistema di Contraddizione

Il giocatore confronta:
- Timeline dell'omicidio
- Testimonianze (confronto A vs B)
- Prove fisiche
- Registrazioni video
- Log accessi elettronici
- Dati transazioni

**Quando trova contraddizione:**
- ✅ Evidenzia automaticamente
- ✅ Permette pressione NPC
- ✅ Aumenta stress target
- ✅ Sblocca informazioni nascoste

---

## SISTEMA CASI PROCEDURALI

### Generatore di Casi

Ogni nuova partita genera:

```javascript
{
  assassino: npcId,
  movente: {
    tipo: "vendetta" | "denaro" | "gelosia" | "sabotaggio" | "ricatto" | "tradimento",
    dettagli_specifici: string,
    persone_coinvolte: [npcId]
  },
  proveLocazione: Map<locationId, proof[]>,
  sequenza_eventi: TimedEvent[],
  testimonifalsi: Map<npcId, npcId> // Chi accusa chi falsamente
}
```

### Possibili Moventi

- **Vendetta** - Rancore personale / aziendale
- **Denaro** - Eredità, assicurazione, ricatto
- **Gelosia** - Relazione, tradimento, rivale
- **Sabotaggio Aziendale** - Competizione corporativa
- **Ricatto** - Vittima ricattava il colpevole
- **Tradimento** - Informazioni riservate vendute

---

## MAPPA & AMBIENTI

### Aree Disponibili

```
Eclipse Complex (Edificio Principale)
├── Piano -2 (Server Room)
│   ├── Stanza Server
│   ├── Backup Storage
│   └── Generatori
├── Piano -1 (Sotterraneo)
│   ├── Magazzino
│   ├── Cella Fredda
│   └── Deposito Chimico
├── Piano 0 (Atrio)
│   ├── Ingresso Principale
│   ├── Reception
│   ├── Bar Neon
│   └── Sala d'Attesa
├── Piano 1 (Amministrazione)
│   ├── Uffici Direttivi
│   ├── Sala Riunioni
│   ├── Archivio
│   └── Ufficio Privato
├── Piano 2 (Laboratori)
│   ├── Lab Ricerca 1
│   ├── Lab Ricerca 2
│   ├── Sala Sicurezza
│   └── Biohazard Storage
├── Piano 3 (Personale)
│   ├── Appartamenti Residence 1-6
│   ├── Palestra
│   ├── Mensa Privata
│   └── Saletta Relax
└── Tetto
    ├── Eliporto
    ├── Trasmettitori
    └── Stanza Generatori Backup
```

### Caratteristiche Mappa

- ✅ Interconnessa e liberamente esplorabile
- ✅ Piena di dettagli ambientali
- ✅ Telecamere in punti strategici
- ✅ Porte bloccabili / hackerabili
- ✅ Sistemi di ventilazione (percorsi alternativi)
- ✅ Aree oscure per tensione
- ✅ Hotspot interattivi

---

## EVENTI DINAMICI

### Trigger Temporali

Durante la partita possono avvenire:

- **Blackout** (ore specifiche) - Telecamere disattivate
- **Sabotaggio Interno** - NPC sabota prove
- **Porte Bloccate** - Isola zone della mappa
- **Incendio** - Distrugge prove, forza evacuazione
- **Allarme** - Stress generale aumentato
- **Fuga NPC** - Tentativo di abbandono
- **Distruzione Prove** - NPC elimina evidenza

### Impatto Narrativo

Gli eventi:
- Aumentano urgenza
- Creano confusione
- Forzano decisioni veloci
- Cambiano dinamica sospetti
- Creano opportunità di deduzione

---

## SISTEMA REPUTAZIONE & INFLUENZA

### Metriche Tracciamento

Per ogni NPC il gioco traccia:

```javascript
{
  fiducia_verso_giocatore: 0-100,
  disponibilita_comunicazione: 0-100,
  sincerità_percepita: 0-100,
  tendenza_cooperazione: 0-100,
  paura_del_giocatore: 0-100
}
```

### Azioni Giocatore → Effetti

| Azione | Effetto |
|--------|---------|
| Accusa ingiusta | ↓ Fiducia, ↑ Ostilità |
| Prova brandita | ↑ Paura, ↓ Sincerità |
| Ascolto empatico | ↑ Fiducia, ↑ Sincerità |
| Minaccia velata | ↑ Paura, ↓ Cooperazione |
| Scoperta segreto | Varia (rabbia o gratitudine) |

### Accesso Informazioni

Reputazione alta sblocca:
- Dettagli aggiuntivi
- Verità nascoste
- Alleanze strategiche
- Accesso zone riservate

---

## SISTEMA DEDUZIONE

### Taccuino Investigativo Features

#### Timeline Interattiva
- Linea temporale oraria dell'omicidio
- Marker per testimonianze
- Prove associate
- Spostamenti NPC tracciabili

#### Archivio Prove
- Catalogazione oggetti trovati
- Fotografie ambientali
- Registrazioni audio
- Documento digitali
- Correlazioni automatiche

#### Profili NPC
- Foto, nome, ruolo
- Motivazione potenziale
- Alibi dichiarato
- Segreti noti
- Relazioni visive

#### Mappa Relazioni
- Grafo visivo NPC
- Tipi relazioni codificate a colore
- Segreti condivisi
- Potenziali conflitti

#### Note Personali
- Ipotesi del giocatore
- Domande aperte
- Osservazioni
- Teorie costruite

### Motore di Contraddizione

Il sistema:
1. **Traccia tutte le affermazioni** di ogni NPC
2. **Confronta automaticamente** dichiarazioni multiple
3. **Rileva incongruenze** nei dettagli
4. **Evidenzia prove contrastanti**
5. **Suggerisce approcci interrogatorio**

---

## FINALI

### Tipologie di Conclusione

Il gioco supporta:

1. **Fine Perfetta**
   - Assassino identificato correttamente
   - Movente rivelato
   - Prove solide
   - Confessione volontaria

2. **Fine Falsa Accusa**
   - Giocatore accusa innocente
   - Vero assassino scoperto dopo (reload?)
   - Conseguenze morali

3. **Fine Fuga**
   - Assassino riesce a scappare
   - Giocatore scopre la verità troppo tardi
   - Epilogo drammatico

4. **Fine Compromesso**
   - Accusa parzialmente corretta
   - Complotti rivelati
   - Molti colpevoli

5. **Fine Resa**
   - Giocatore abbandona investigazione
   - NPC ne prendono il controllo
   - Risultati casuali

### Epilogo Dinamico

Basato su:
- Accuratezza accusa
- Numero NPC feriti/traumatizzati
- Reputazione finale
- Segreti scoperti
- Prove distrutte

---

## TECNOLOGIE & ARCHITETTURA

### Stack Tecnologico

**Frontend:**
- React 19
- Vite (build & dev)
- HTML5 Canvas 2D (rendering gioco)
- TypeScript
- Tailwind CSS (UI)
- Motion (animazioni)

**Backend (Opzionale - per multiplayer):**
- Node.js + Express
- WebSocket (real-time)
- Database: MongoDB/PostgreSQL

**Hosting:**
- GitHub Pages (build statico)
- O Vercel (serverless)

### Struttura Progetto

```
src/
├── components/
│   ├── Game.tsx
│   ├── Canvas/
│   │   ├── GameRenderer.tsx
│   │   └── Renderer2D.ts
│   ├── UI/
│   │   ├── HUD.tsx
│   │   ├── Notebook.tsx
│   │   └── DialogueBox.tsx
│   └── Modals/
│       ├── CharacterProfile.tsx
│       └── Evidence.tsx
├── game/
│   ├── engine/
│   │   ├── GameState.ts
│   │   ├── EventManager.ts
│   │   └── CaseGenerator.ts
│   ├── ai/
│   │   ├── NPCManager.ts
│   │   ├── NPCAIBehavior.ts
│   │   ├── DialogueEngine.ts
│   │   └── PathFinding.ts
│   ├── types/
│   │   ├── Game.types.ts
│   │   ├── NPC.types.ts
│   │   └── Evidence.types.ts
│   └── utils/
│       ├── ProceduralGenerator.ts
│       ├── ContradictionDetector.ts
│       └── SaveLoadSystem.ts
├── assets/
│   ├── sprites/
│   ├── audio/
│   └── palettes.ts
└── App.tsx
```

---

## SISTEMI AVANZATI

### Pathfinding A*
- Navigazione naturale NPC
- Evitare ostacoli dinamici
- Cache percorsi

### Field of View
- Visibilità NPC
- Reazione a giocatore
- Telespettatore da telecamere

### Sistema Sospetto
- Metriche sospetto NPC
- Evoluzione dinamica
- Visualizzazione grafica

### Memoria NPC
- Ricordo conversazioni
- Reazione conseguente
- Dimenticanza (stress)

### Routine Giornaliere
- Schedule fisso + variazioni
- Punti di incontro
- Sincronizzazione gruppo

### Gestione Eventi Real-Time
- Timer accurati
- Trigger condizionali
- Cascata effetti

---

## OBIETTIVO FINALE

Creare un'esperienza:

✅ **Tesa** - Pressione psicologica costante  
✅ **Intelligente** - AI realistico e reattivo  
✅ **Rigiocabile** - Procedura casuale garantisce varietà  
✅ **Immersiva** - Atmosfera cyberpunk coerente  
✅ **Psicologica** - Tensione sociale e paranoia  
✅ **Investigativa** - Vero puzzle narrativo  

Con forte enfasi su:
- 🎯 Comportamento AI sofisticato
- 🎯 Deduzione logica
- 🎯 Narrativa emergente
- 🎯 Conseguenze scelte
- 🎯 Atmosfera cyberpunk noir

---

## PRIORITÀ DI SVILUPPO

### Fase 1: Core (MVP)
1. Renderer 2D base + controllore giocatore
2. NPC movimento/routine base
3. Sistema dialogo semplice
4. Raccolta prove
5. Timeline annotazione

### Fase 2: Meccaniche
1. AI comportamenti complessi
2. Sistema contraddizione
3. Generatore casi procedurali
4. Eventi dinamici
5. Notebook pieno

### Fase 3: Polish
1. Rendering avanzato (neon effects)
2. Audio design
3. Animazioni fluide
4. Finali multipli
5. Save/Load system

### Fase 4: Contenuto
1. Varietà NPC
2. Varietà ambienti
3. Varietà dialoghi
4. Varietà moventi
5. Replayability testing

---

## NOTE IMPLEMENTAZIONE

- **GitHub Pages Compatible**: Build statico, niente server richiesto (per ora)
- **TypeScript First**: Type safety per complessa logica AI
- **Canvas Rendering**: Performance su browser
- **Modular Architecture**: Facile espansione
- **Procedural First**: Varietà garantita dalla generazione
- **Player Agency**: Scelte meaningful impattano narrativa

---

**Versione**: 1.0  
**Stato**: Specification Document  
**Ultimo Update**: 2026-05-27
