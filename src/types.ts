export interface Suspect {
  id: string; // "leona" | "jax" | "raze" | "aria" | "kaelen"
  name: string;
  codename: string;
  role: string;
  status: "ALIVE" | "DEAD" | "ACCUSED" | "EXILED";
  color: string;
  bgColor: string;
  borderHex: string;
  description: string;
  personality: string;
  secret: string;
  guiltySecret: string; // what they hide about Vance
  motive: string;
  stress: number; // 0 to 100
  fear: number; // 0 to 100
  honesty: number; // 0 to 100
  aggressiveness: number; // 0 to 100
  relationships: { [key: string]: string }; // opinions on other characters
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  room: string;
  spriteIndex: number;
}

export interface Clue {
  id: string;
  name: string;
  description: string;
  type: "PHYSICAL" | "DIGITAL" | "ALIBI";
  location: string; // Room ID where it was found
  discovered: boolean;
  icon: string;
}

export interface TermLog {
  timestamp: string;
  message: string;
  room: string;
}

export interface RoomState {
  id: string; // "LOBBY" | Room code
  players: { [id: string]: Player };
  suspects: Suspect[];
  clues: Clue[];
  termLogs: TermLog[];
  isGameStarted: boolean;
  murderedId: string | null;
  killerId: string; // can be an NPC or Player
  crimeRoom: string;
  crimeMotive: string;
  timeRemaining: number;
  meetingActive: boolean;
  meetingLog: string[];
  meetingTimer: number;
  votes: { [voterId: string]: string }; // voter -> targetId
  sabotageActive: "NONE" | "LIGHTS" | "AI_GLITCH";
  sabotageTimer: number;
  winner: "DETECTIVES" | "KILLER" | null;
}

export interface Player {
  id: string;
  name: string;
  characterId: string; // "detective_player" | suspect ID if multiplayer
  color: string;
  role: "DETECTIVE" | "KILLER";
  x: number;
  y: number;
  room: string;
  online: boolean;
  score: number;
  tasksCompleted: number;
  totalTasks: number;
}

export interface DialogueMessage {
  sender: string;
  text: string;
  timestamp: string;
  isAi: boolean;
}

export interface InterrogationState {
  suspectId: string;
  chatHistory: DialogueMessage[];
  lastInterrogatedAt: number;
}
