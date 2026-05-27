import React, { useEffect, useRef, useState } from "react";
import { Suspect, Clue, Player } from "../types";
import { HelpCircle, AlertTriangle, Eye, Activity, Heart, Zap, Sparkles } from "lucide-react";

interface NeonCanvasMapProps {
  player: Player;
  otherPlayers: Player[];
  suspects: Suspect[];
  clues: Clue[];
  crimeRoom: string;
  sabotageActive: "NONE" | "LIGHTS" | "AI_GLITCH";
  onPlayerMove: (x: number, y: number, roomName: string) => void;
  onInterrogate: (suspect: Suspect) => void;
  onInspectClue: (clueId: string) => void;
  onReportBody: () => void;
  onFixSabotage: () => void;
  onTriggerSabotage: () => void;
}

export default function NeonCanvasMap({
  player,
  otherPlayers,
  suspects,
  clues,
  crimeRoom,
  sabotageActive,
  onPlayerMove,
  onInterrogate,
  onInspectClue,
  onReportBody,
  onFixSabotage,
  onTriggerSabotage
}: NeonCanvasMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // High quality graphics size
  const MAP_W = 850;
  const MAP_H = 500;

  // Selected interactive targets from distance calculations
  const [nearestSuspect, setNearestSuspect] = useState<Suspect | null>(null);
  const [nearestClue, setNearestClue] = useState<Clue | null>(null);
  const [nearBody, setNearBody] = useState(false);

  // Body specifications
  const BODY_POS = {
    "VIP Lounge": { x: 180, y: 120 },
    "Retro Neon Bar": { x: 620, y: 120 },
    "Hollow-Lab": { x: 400, y: 270 },
    "Server Room Central": { x: 180, y: 410 },
    "Damp Maintenance Alley": { x: 620, y: 410 }
  }[crimeRoom] || { x: 400, y: 270 };

  // Rooms boxes layout coordinates: [x, y, w, h]
  const ROOMS_CONFIG = [
    { name: "VIP Lounge", x: 40, y: 40, w: 320, h: 160, color: "rgba(168, 85, 247, 0.04)", border: "rgba(168, 85, 247, 0.35)", keyColor: "#a855f7" },
    { name: "Retro Neon Bar", x: 490, y: 40, w: 320, h: 160, color: "rgba(234, 179, 8, 0.04)", border: "rgba(234, 179, 8, 0.35)", keyColor: "#eab308" },
    { name: "Hollow-Lab", x: 260, y: 220, w: 330, h: 120, color: "rgba(0, 255, 204, 0.04)", border: "rgba(0, 255, 204, 0.35)", keyColor: "#00ffcc" },
    { name: "Server Room Central", x: 40, y: 360, w: 320, h: 110, color: "rgba(59, 130, 246, 0.04)", border: "rgba(59, 130, 246, 0.35)", keyColor: "#3b82f6" },
    { name: "Damp Maintenance Alley", x: 490, y: 360, w: 320, h: 110, color: "rgba(225, 29, 72, 0.04)", border: "rgba(225, 29, 72, 0.35)", keyColor: "#e11d48" }
  ];

  // Map static accessories drawing items
  const WALLS_BOUNDS = [
    // Center block limits
    { x: 0, y: 0, w: MAP_W, h: 10 },
    { x: 0, y: MAP_H - 10, w: MAP_W, h: 10 },
    { x: 0, y: 0, w: 10, h: MAP_H },
    { x: MAP_W - 10, y: 0, w: 10, h: MAP_H }
  ];

  // Helper detect current room name
  const getCurrentRoomName = (px: number, py: number): string => {
    for (const r of ROOMS_CONFIG) {
      if (px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h) {
        return r.name;
      }
    }
    return "Corridoio";
  };

  // Move controller handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      let dx = 0;
      let dy = 0;
      const speed = 15;

      if (e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
        dy = -speed;
      }
      if (e.key === "ArrowDown" || e.key.toLowerCase() === "s") {
        dy = speed;
      }
      if (e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
        dx = -speed;
      }
      if (e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
        dx = speed;
      }

      if (dx !== 0 || dy !== 0) {
        let newX = Math.min(MAP_W - 35, Math.max(35, player.x + dx));
        let newY = Math.min(MAP_H - 35, Math.max(35, player.y + dy));

        // Stop characters from escaping deep boundaries
        const rName = getCurrentRoomName(newX, newY);
        onPlayerMove(newX, newY, rName);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [player, onPlayerMove]);

  // Canvas Redraw Logic Frame tick
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear Canvas
    ctx.fillStyle = "#030009";
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // Draw Cyber Grid Overlay
    ctx.strokeStyle = "rgba(139, 92, 246, 0.03)";
    ctx.lineWidth = 1;
    const cellSize = 30;
    for (let lx = 0; lx < MAP_W; lx += cellSize) {
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, MAP_H);
      ctx.stroke();
    }
    for (let ly = 0; ly < MAP_H; ly += cellSize) {
      ctx.beginPath();
      ctx.moveTo(0, ly);
      ctx.lineTo(MAP_W, ly);
      ctx.stroke();
    }

    // Draw Corridors Connection paths
    ctx.fillStyle = "rgba(22, 13, 44, 0.45)";
    // Vertical left connector
    ctx.fillRect(160, 180, 80, 200);
    // Vertical right connector
    ctx.fillRect(610, 180, 80, 200);
    // Horizontal center connect corridors
    ctx.fillRect(100, 240, 650, 60);

    // Draw Room boxes and Labels
    ROOMS_CONFIG.forEach(r => {
      // Background Glow Fill
      ctx.fillStyle = r.color;
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // Neon Border outer lines
      ctx.strokeStyle = r.border;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(r.x, r.y, r.w, r.h);

      // Inner corners design detail
      ctx.strokeStyle = r.border;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(r.x + 4, r.y + 4, r.w - 8, r.h - 8);

      // Room Floating Title Label in Space Grotesk size
      ctx.fillStyle = r.keyColor;
      ctx.font = "bold 10px 'JetBrains Mono', Courier, monospace";
      ctx.fillText(`// DEPT: ${r.name.toUpperCase()}`, r.x + 12, r.y + 22);
    });

    // Draw Security Terminals icons scattered (Action Targets)
    clues.forEach(clue => {
      const pos = {
        "VIP Lounge": { x: 70, y: 150 },
        "Retro Neon Bar": { x: 770, y: 150 },
        "Hollow-Lab": { x: 425, y: 240 },
        "Server Room Central": { x: 74, y: 440 },
        "Damp Maintenance Alley": { x: 770, y: 440 }
      }[clue.location] || { x: 425, y: 240 };

      // Clue marker radar bulb
      if (!clue.discovered) {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#a855f7"; // purple interactive clue pulsing glow
        ctx.fill();
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#a855f7";
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 10 + Math.sin(Date.now() / 150) * 4, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(168,85,247,0.4)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      } else {
        // Discovered Indicator
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(16, 185, 129, 0.4)"; // muted emerald
        ctx.fill();
      }
    });

    // Draw Arthur Vance's Dead Body Outline
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#ef4444";
    ctx.strokeStyle = "rgba(239, 68, 68, 0.75)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    // Simulate chalk outline of victim body on canvas
    ctx.arc(BODY_POS.x, BODY_POS.y, 12, 0, Math.PI * 2);
    ctx.moveTo(BODY_POS.x - 12, BODY_POS.y);
    ctx.lineTo(BODY_POS.x + 12, BODY_POS.y);
    ctx.moveTo(BODY_POS.x, BODY_POS.y - 12);
    ctx.lineTo(BODY_POS.x, BODY_POS.y + 12);
    ctx.stroke();

    // Red Biological Hazard sign flashing icon
    ctx.fillStyle = Date.now() % 1000 < 500 ? "#ef4444" : "rgba(239, 68, 68, 0.35)";
    ctx.font = "bold 8px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText("CORPSE // HAZARD_LOCK", BODY_POS.x, BODY_POS.y - 18);
    ctx.restore();

    // Draw other online guest players (simulated or real-time connected)
    otherPlayers.forEach(p => {
      if (!p.online) return;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Label guest
      ctx.fillStyle = "#ffffff";
      ctx.font = "9px 'JetBrains Mono', Arial";
      ctx.textAlign = "center";
      ctx.fillText(p.name, p.x, p.y - 16);
    });

    // Draw NPC Suspect Suspects
    suspects.forEach(sus => {
      if (sus.status !== "ALIVE") return;

      // Draw Suscept avatar bulb
      ctx.beginPath();
      ctx.arc(sus.x, sus.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = sus.color;
      ctx.fill();
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Neon glow highlight circle around them
      ctx.strokeStyle = sus.borderHex;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(sus.x, sus.y, 14, 0, Math.PI * 2);
      ctx.stroke();

      // Show Suspect Identifier Tag on canvas
      ctx.fillStyle = "#ffffff";
      ctx.font = "9px 'JetBrains Mono', Courier";
      ctx.textAlign = "center";
      ctx.fillText(sus.name, sus.x, sus.y - 18);
    });

    // Draw Main Detective Player Entity
    ctx.save();
    ctx.beginPath();
    ctx.arc(player.x, player.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = player.color; // purple prime color
    ctx.fill();

    // Sleek white tracking target cross outline
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(player.x, player.y, 16, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(168, 85, 247, 0.6)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Glowing target name-tag
    ctx.fillStyle = "#a855f7";
    ctx.font = "bold 9px 'JetBrains Mono', Arial";
    ctx.textAlign = "center";
    ctx.fillText(`${player.name} (YOU)`, player.x, player.y - 20);
    ctx.restore();

    // Dynamic Vignette / Shadows implementation (Hacker Visual Fog of War)
    const darknessRadius = sabotageActive === "LIGHTS" ? 95 : 220;
    
    // Draw outer darkness masking layout
    const gradient = ctx.createRadialGradient(
      player.x, player.y, darknessRadius * 0.4, 
      player.x, player.y, darknessRadius
    );
    gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    gradient.addColorStop(0.7, "rgba(3, 1, 10, 0.45)");
    gradient.addColorStop(1, "rgba(3, 1, 10, 0.96)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // If sabotage is active, render alert text overlays
    if (sabotageActive === "LIGHTS") {
      ctx.fillStyle = "rgba(239, 68, 68, 0.8)";
      ctx.font = "bold 10px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("⚠️ CRITICAL SABOTAGE: LIGHT FILTERS OVERRIDDEN - VISIBILITY COLDDOWN", MAP_W / 2, 28);
    }
  }, [player, otherPlayers, suspects, clues, crimeRoom, sabotageActive]);

  // Handle Action Radius distance calculator targets
  useEffect(() => {
    // 1. Check nearest suspect
    let minSusDist = 70; // 70px threshold trigger option
    let currentNearestSus: Suspect | null = null;
    suspects.forEach(sus => {
      if (sus.status === "ALIVE") {
        const d = Math.hypot(player.x - sus.x, player.y - sus.y);
        if (d < minSusDist) {
          minSusDist = d;
          currentNearestSus = sus;
        }
      }
    });
    setNearestSuspect(currentNearestSus);

    // 2. Check nearest clue
    let minClueDist = 55;
    let currentNearestClue: Clue | null = null;
    clues.forEach(clue => {
      if (!clue.discovered) {
        // Clue scattered coordinates reference
        const pos = {
          "VIP Lounge": { x: 70, y: 150 },
          "Retro Neon Bar": { x: 770, y: 150 },
          "Hollow-Lab": { x: 425, y: 240 },
          "Server Room Central": { x: 74, y: 440 },
          "Damp Maintenance Alley": { x: 770, y: 440 }
        }[clue.location] || { x: 425, y: 240 };

        const d = Math.hypot(player.x - pos.x, player.y - pos.y);
        if (d < minClueDist) {
          minClueDist = d;
          currentNearestClue = clue;
        }
      }
    });
    setNearestClue(currentNearestClue);

    // 3. Near Vance Corpse Body
    const bodyDist = Math.hypot(player.x - BODY_POS.x, player.y - BODY_POS.y);
    setNearBody(bodyDist < 60);

  }, [player, suspects, clues, crimeRoom]);

  // Mouse canvas direction controller click
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const scaleX = MAP_W / rect.width;
    const scaleY = MAP_H / rect.height;

    const targetX = Math.round(clickX * scaleX);
    const targetY = Math.round(clickY * scaleY);

    const rName = getCurrentRoomName(targetX, targetY);
    onPlayerMove(targetX, targetY, rName);
  };

  return (
    <div id="canvas-radar-container" className="space-y-4">
      
      {/* HUD Info Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-black/60 border border-cyan-500/20 px-4 py-2.5 rounded-xl font-mono text-xs relative z-10 shadow-sm backdrop-blur-md">
        <div className="flex items-center space-x-2 text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>Sottovento Bio-Metric Tracker // SETTORE SECTOR:</span>
          <span className="text-cyan-400 font-extrabold uppercase bg-cyan-950/40 px-2 py-0.5 rounded">{player.room}</span>
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-emerald-400 font-bold tracking-widest text-[9px]">RADAR_SYS: STABILE</span>
        </div>
      </div>

      {/* Main Canvas Node */}
      <div className="relative cyber-border-cyan rounded-2xl overflow-hidden shadow-[0_0_25px_rgba(34,211,238,0.12)] bg-[#030009] z-10">
        <canvas
          ref={canvasRef}
          width={MAP_W}
          height={MAP_H}
          onClick={handleCanvasClick}
          className="w-full aspect-[85/50] block cursor-crosshair active:brightness-95 transition-all"
        />

        {/* Floating Quick Mini Instructions for usability */}
        <div className="absolute bottom-3 left-4 bg-black/75 border border-cyan-500/25 px-3 py-1.5 rounded-lg text-[9px] text-cyan-300/80 font-mono flex items-center space-x-1.5 select-none pointer-events-none">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Usa WASD / Frecce o CANV_CLICK per muovere il tuo detective</span>
        </div>
      </div>

      {/* Action triggers buttons panel based on nearest element distance */}
      <div id="canvas-action-panel" className="grid grid-cols-1 md:grid-cols-3 gap-3 relative z-10">
        {/* Interrogate Suspect trigger */}
        <button
          disabled={!nearestSuspect}
          onClick={() => nearestSuspect && onInterrogate(nearestSuspect)}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border font-mono font-bold text-xs tracking-wider transition-all uppercase ${
            nearestSuspect
              ? "bg-[#082f49]/60 hover:bg-cyan-950 text-cyan-200 hover:text-white border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.15)] cursor-pointer active:scale-98"
              : "bg-black/40 border-[#1e1e1e] text-slate-600 cursor-not-allowed opacity-40 font-semibold"
          }`}
        >
          <HelpCircle className="w-4.5 h-4.5 shrink-0" />
          <span>
            {nearestSuspect ? `INTERROGA ${nearestSuspect.name.toUpperCase()}` : "Avvicinati ai Sospetti"}
          </span>
        </button>

        {/* Inspect clue trigger */}
        <button
          disabled={!nearestClue}
          onClick={() => nearestClue && onInspectClue(nearestClue.id)}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border font-mono font-bold text-xs tracking-wider transition-all uppercase ${
            nearestClue
              ? "bg-[#1e1b4b]/60 hover:bg-purple-950 text-purple-200 hover:text-white border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)] cursor-pointer active:scale-98"
              : "bg-black/40 border-[#1e1e1e] text-slate-600 cursor-not-allowed opacity-40 font-semibold"
          }`}
        >
          <Eye className="w-4.5 h-4.5 shrink-0" />
          <span>
            {nearestClue ? `ANALIZZA REPERTO: ${nearestClue.name.toUpperCase()}` : "Nessun reperto vicino"}
          </span>
        </button>

        {/* Report Body / Trigger Emergency Meeting */}
        <button
          disabled={!nearBody}
          onClick={onReportBody}
          className={`flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl border font-mono font-bold text-xs tracking-wider transition-all uppercase ${
            nearBody
              ? "bg-rose-950/60 hover:bg-rose-900 border-rose-500/50 text-rose-200 hover:text-white shadow-[0_0_15px_rgba(244,63,94,0.25)] cursor-pointer active:scale-98 animate-pulse"
              : "bg-black/40 border-[#1e1e1e] text-slate-600 cursor-not-allowed opacity-40 font-semibold"
          }`}
        >
          <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
          <span>CONVOCA CELLULA EMERGENZA</span>
        </button>
      </div>

      {/* Cyberpunk Host sabotage overrides panel */}
      <div className="bg-black/60 border border-cyan-950 rounded-xl p-3.5 flex flex-col md:flex-row justify-between items-center gap-3 relative z-10 backdrop-blur-md">
        <div className="flex items-center space-x-2 text-[10px] text-cyan-400 font-mono">
          <Activity className="w-4 h-4 text-cyan-500" />
          <span>PRE-SABOTAGGIO TRACCIAMENTO REATTORE SECTOR:</span>
        </div>

        <div className="flex space-x-2">
          {sabotageActive !== "NONE" ? (
            <button
               onClick={onFixSabotage}
               className="bg-emerald-950/40 hover:bg-[#064e3b] text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-3 py-1.5 rounded transition-all uppercase font-mono cursor-pointer"
            >
              🛠️ RIPARA FILTRI ALIMENTAZIONE
            </button>
          ) : (
            <button
              onClick={onTriggerSabotage}
              className="bg-cyan-950/30 hover:bg-[#0f172a] text-cyan-400 hover:text-cyan-200 border border-cyan-500/30 text-[10px] font-bold px-3 py-1.5 rounded transition-all uppercase font-mono cursor-pointer"
            >
              ⚡ FORZA OVERRIDE GENERATORE (SABOTAGGIO)
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
