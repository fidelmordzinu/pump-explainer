import React from "react";
import {useCurrentFrame} from "remotion";
import {RealisticTank3D, getTankState} from "./RealisticTank3D";

const Panel: React.FC<{
  title: string;
  subtitle: string;
  tone: string;
  mode: "lost-air" | "damaged-bladder";
  progress: number;
}> = ({title, subtitle, tone, mode, progress}) => {
  const state = getTankState(progress, mode);
  return (
    <div
      style={{
        width: 400,
        borderRadius: 22,
        border: `1px solid ${tone}55`,
        background: "rgba(15,23,42,0.55)",
        overflow: "hidden",
      }}
    >
      <div style={{padding: "14px 16px 8px"}}>
        <div style={{fontSize: 18, fontWeight: 800, color: tone, letterSpacing: 1}}>{title}</div>
        <div style={{fontSize: 16, color: "#cbd5e1", marginTop: 4}}>{subtitle}</div>
      </div>
      <RealisticTank3D progress={progress} width={400} height={360} mode={mode} showGauge compact />
      <div style={{display: "flex", justifyContent: "space-between", padding: "10px 14px 14px", fontSize: 17, color: "#e2e8f0"}}>
        <span>Pressure: <strong>{state.pressure} PSI</strong></span>
        <span style={{color: state.pumpOn ? "#fbbf24" : "#94a3b8"}}>{state.pumpOn ? "Pump restarts" : "Pump off"}</span>
      </div>
    </div>
  );
};

export const RealisticTankComparison3D: React.FC = () => {
  const frame = useCurrentFrame();
  const progress = (frame % 210) / 209;
  return (
    <div style={{width: 840, height: 560, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"}}>
      <div style={{display: "flex", gap: 20}}>
        <Panel
          title="A · LOST PRE-CHARGE"
          subtitle="Air cushion too small, pressure drops fast"
          tone="#60a5fa"
          mode="lost-air"
          progress={progress}
        />
        <Panel
          title="B · DAMAGED BLADDER"
          subtitle="Bladder lets water through, little storage"
          tone="#fb7185"
          mode="damaged-bladder"
          progress={progress}
        />
      </div>
      <div style={{marginTop: 14, fontSize: 18, color: "#94a3b8", textAlign: "center", maxWidth: 760}}>
        Different failures, similar result: the tank cannot store enough usable water, so pressure falls quickly.
      </div>
    </div>
  );
};
