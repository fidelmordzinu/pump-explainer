import React from "react";
import {useCurrentFrame} from "remotion";
import {RealisticTank3D, getTankState} from "./RealisticTank3D";
import {REELS_SAFE_AREA} from "./reelsSafeArea";

const WIDTH = 1080;
const HEIGHT = 1920;
const FPS = 30;
const DURATION = 12 * FPS;

export const Tank3DProof: React.FC = () => {
  const frame = useCurrentFrame();
  const cycle = (frame % 240) / 240;
  const {pressure, pumpOn, fill} = getTankState(cycle, "healthy");
  const airSpace = Math.max(0, Math.round((1 - fill) * 100));

  return (
    <div
      style={{
        width: WIDTH,
        height: HEIGHT,
        background: "#071018",
        position: "relative",
        color: "#f8fafc",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <RealisticTank3D
        progress={cycle}
        width={WIDTH}
        height={1220}
        mode="healthy"
        showGauge
      />

      <div
        style={{
          position: "absolute",
          top: REELS_SAFE_AREA.top,
          left: REELS_SAFE_AREA.left,
          right: REELS_SAFE_AREA.right,
        }}
      >
        <div style={{fontSize: 22, letterSpacing: 3, color: "#67e8f9", fontWeight: 700}}>
          PROOF OF CONCEPT · REALISTIC 3D PRESSURE TANK CUTAWAY
        </div>
        <h1 style={{margin: "16px 0 0", fontSize: 54, lineHeight: 1.1}}>
          Moving bladder, water, and compressed air
        </h1>
        <p style={{margin: "14px 0 0", fontSize: 28, lineHeight: 1.45, color: "#b7c4d5", maxWidth: 820}}>
          Steel shell cutaway with a rubber bladder inside. Water fills the bladder and squeezes the compressed air around it.
        </p>
      </div>

      <div style={{position: "absolute", left: REELS_SAFE_AREA.left, top: 520, display: "grid", gap: 12, maxWidth: 460}}>
        <div style={{padding: "14px 18px", borderRadius: 14, background: "rgba(15,23,42,0.82)", border: "1px solid #334155", fontSize: 22}}>
          <span style={{color: "#a78bfa", fontWeight: 700}}>Compressed air</span>: around the bladder, acts like a spring
        </div>
        <div style={{padding: "14px 18px", borderRadius: 14, background: "rgba(15,23,42,0.82)", border: "1px solid #334155", fontSize: 22}}>
          <span style={{color: "#c4b5fd", fontWeight: 700}}>Rubber bladder</span>: stretches as water enters
        </div>
        <div style={{padding: "14px 18px", borderRadius: 14, background: "rgba(15,23,42,0.82)", border: "1px solid #334155", fontSize: 22}}>
          <span style={{color: "#38bdf8", fontWeight: 700}}>Water</span>: stored inside the bladder
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          right: REELS_SAFE_AREA.right,
          top: 560,
          width: 280,
          padding: 22,
          borderRadius: 22,
          background: "rgba(15,23,42,0.86)",
          border: "1px solid #334155",
        }}
      >
        <div style={{fontSize: 18, color: "#94a3b8", letterSpacing: 2}}>STATUS</div>
        <div style={{marginTop: 10, fontSize: 32, fontWeight: 700, color: pumpOn ? "#34d399" : "#fbbf24"}}>
          {pumpOn ? "Pump filling tank" : "Tap using stored water"}
        </div>
        <div style={{marginTop: 16, fontSize: 22}}>Pressure: <strong>{pressure} PSI</strong></div>
        <div style={{marginTop: 8, fontSize: 22}}>Range: <strong>30–50 PSI</strong></div>
        <div style={{marginTop: 8, fontSize: 22}}>Pre-charge: <strong>28 PSI</strong> (empty, 0 PSI water)</div>
        <div style={{marginTop: 8, fontSize: 22}}>Air space: <strong>{airSpace}%</strong></div>
      </div>

      <div
        style={{
          position: "absolute",
          left: REELS_SAFE_AREA.left,
          right: REELS_SAFE_AREA.right,
          bottom: REELS_SAFE_AREA.bottom - 40,
          padding: "16px 18px",
          borderTop: "1px solid #334155",
          display: "flex",
          justifyContent: "space-between",
          gap: 16,
          fontSize: 18,
          color: "#94a3b8",
        }}
      >
        <span>3D geometry · PBR materials · lighting · shadows · camera · cutaway · Reels safe area</span>
        <span>{Math.round(fill * 100)}% bladder fill</span>
      </div>
    </div>
  );
};

export const TANK_PROOF_DURATION = DURATION;
export const TANK_PROOF_FPS = FPS;
