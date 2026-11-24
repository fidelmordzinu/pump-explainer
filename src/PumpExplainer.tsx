import React from "react";
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import {
  FailedTankComparison,
  MotorStressAnimation,
  NormalTankCycle,
  PressureSwitchMechanism,
  PumpSystemAnimation,
  TechnicianRepairSequence,
} from "./EngineeringVisuals";
import {RealisticTank3D} from "./RealisticTank3D";
import {RealisticTankComparison3D} from "./RealisticTankComparison3D";
import {REELS_SAFE_AREA} from "./reelsSafeArea";

const C = {
  bg: "#0B1120",
  border: "#334155",
  text: "#F8FAFC",
  muted: "#94A3B8",
  blue: "#38BDF8",
  cyan: "#67E8F9",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#FB7185",
};

const SCENES = [
  {
    badge: "THE PROBLEM",
    status: "✗ SHORT-CYCLING",
    title: "Your pump keeps\nstarting and stopping.",
    body: "A few seconds later, it starts again. Repeated starts can wear out the motor.",
    kicker: "PUMP ON · PUMP OFF · PUMP ON",
  },
  {
    badge: "HOW IT SHOULD WORK",
    status: "NORMAL",
    title: "The tank holds water\nfor you.",
    body: "Compressed air acts like a spring and pushes water through the tap. The pump stops at 50 PSI and starts again at 30 PSI.",
    kicker: "AIR PRESSURE IN THE EMPTY TANK · 28 PSI",
  },
  {
    badge: "THE FAILURE",
    status: "LITTLE STORAGE",
    title: "The tank cannot\nstore enough water.",
    body: "Lost air and a ruptured bladder are two different failures. A small draw can make pressure fall fast.",
    kicker: "PRESSURE FALLS · PUMP RESTARTS",
  },
  {
    badge: "THE RESULT",
    status: "SWITCH RESTARTS PUMP",
    title: "The pressure switch\nsenses the drop.",
    body: "At 30 PSI, the switch turns the pump on. Repeated starts add stress and heat.",
    kicker: "REPEATED RESTARTS",
  },
  {
    badge: "WHY IT MATTERS",
    status: "STARTUP + HEAT",
    title: "Starting draws extra\nelectricity.",
    body: "Every start can draw more electricity than steady running. Repeated starting builds heat in the motor.",
    kicker: "ILLUSTRATIVE GRAPH · NOT A MOTOR SPECIFICATION",
  },
  {
    badge: "THE FIX",
    status: "FIXING",
    title: "Check it safely.\nFix the right problem.",
    body: "Switch off power, drain to zero, then set air pressure to 28 PSI. Replace the tank if the bladder is damaged.",
    kicker: "28 PSI · TANK DRAINED · ZERO WATER PRESSURE",
  },
];

const REFERENCE_PHOTOS: Record<number, Array<{src: string; alt: string}>> = {
  0: [{src: "pump-system.jpg", alt: "Original water pump and pipework photograph"}],
  1: [{src: "pressure-tank.jpg", alt: "Original pressure tank photograph"}],
  2: [{src: "pressure-tank.jpg", alt: "Original pressure tank photograph"}],
  3: [{src: "pressure-switch-gauge.jpg", alt: "Pressure switch and gauge equipment render"}],
  4: [{src: "electric-motor.jpg", alt: "Motor equipment cutaway render"}],
  5: [
    {src: "breaker-panel.jpg", alt: "Original electrical panel photograph"},
    {src: "pressure-tank.jpg", alt: "Original pressure tank photograph"},
  ],
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const fadeUp = (frame: number, delay = 0) => {
  const opacity = interpolate(frame, [delay, delay + 16], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const y = interpolate(frame, [delay, delay + 18], [24, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return {opacity, transform: `translateY(${y}px)`};
};

const mono: React.CSSProperties = {
  fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', monospace",
  letterSpacing: "0.12em",
};

const Label: React.FC<{
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
}> = ({children, color = C.muted, style}) => (
  <div
    style={{
      ...mono,
      color,
      fontSize: 20,
      fontWeight: 700,
      lineHeight: 1.35,
      ...style,
    }}
  >
    {children}
  </div>
);

const SectionBadge: React.FC<{text: string}> = ({text}) => (
  <div
    style={{
      padding: "13px 20px",
      borderRadius: 999,
      border: `1px solid ${C.border}`,
      background: "rgba(30,41,59,0.8)",
      color: C.cyan,
      ...mono,
      fontSize: 18,
      fontWeight: 700,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

const StatusPill: React.FC<{text: string; tone?: string}> = ({
  text,
  tone = C.blue,
}) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      alignSelf: "flex-start",
      padding: "13px 19px",
      borderRadius: 999,
      border: `1px solid ${tone}55`,
      background: `${tone}16`,
      color: tone,
      ...mono,
      fontSize: 18,
      fontWeight: 800,
      whiteSpace: "nowrap",
    }}
  >
    {text}
  </div>
);

const ProgressTracker: React.FC<{scene: number; progress: number}> = ({
  scene,
  progress,
}) => (
  <div style={{width: 240}}>
    <div style={{display: "flex", justifyContent: "space-between", marginBottom: 15}}>
      {Array.from({length: 6}, (_, i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 14,
            borderRadius: 99,
            background: i < scene ? C.blue : i === scene ? C.cyan : "#334155",
            boxShadow: i === scene ? `0 0 16px ${C.blue}99` : "none",
          }}
        />
      ))}
    </div>
    <div style={{height: 5, borderRadius: 9, background: "#334155", overflow: "hidden"}}>
      <div
        style={{
          width: `${clamp(progress * 100, 0, 100)}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${C.blue}, ${C.cyan})`,
        }}
      />
    </div>
  </div>
);

const Header: React.FC<{
  scene: number;
  progress: number;
  badge: string;
}> = ({scene, progress, badge}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: 20,
    }}
  >
    <SectionBadge text={badge} />
    <ProgressTracker scene={scene} progress={progress} />
  </div>
);

const SceneHeading: React.FC<{
  title: string;
  body: string;
  frame: number;
}> = ({title, body, frame}) => (
  <div style={{...fadeUp(frame, 4), marginTop: 62}}>
    <h1
      style={{
        margin: 0,
        color: C.text,
        fontSize: 67,
        lineHeight: 1.08,
        letterSpacing: "-0.045em",
        fontWeight: 760,
        whiteSpace: "pre-line",
      }}
    >
      {title}
    </h1>
    <p
      style={{
        color: "#B7C4D5",
        fontSize: 29,
        lineHeight: 1.48,
        margin: "27px 0 0",
        maxWidth: 850,
      }}
    >
      {body}
    </p>
  </div>
);

const Footer: React.FC<{text: string; tone?: string}> = ({
  text,
  tone = C.cyan,
}) => (
  <div
    style={{
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${C.border}`,
      paddingTop: 22,
    }}
  >
    <Label color={tone}>{text}</Label>
    <Label style={{fontSize: 16}}>PUMP SYSTEMS / FIELD GUIDE</Label>
  </div>
);

const ReferenceStrip: React.FC<{scene: number}> = ({scene}) => {
  const photos = REFERENCE_PHOTOS[scene];
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        margin: "4px 12px 0",
        paddingTop: 13,
        borderTop: "1px solid rgba(71,85,105,0.55)",
      }}
    >
      <Label style={{fontSize: 10, lineHeight: 1.4, width: 108, flexShrink: 0}}>
        HARDWARE<br />REFERENCE
      </Label>
      {photos.map(({src, alt}) => (
        <div
          key={src}
          style={{
            position: "relative",
            width: 118,
            height: 70,
            overflow: "hidden",
            border: "1px solid rgba(148,163,184,0.45)",
            borderRadius: 9,
            background: "#0B1120",
          }}
        >
          <Img
            src={staticFile(`assets/${src}`)}
            alt={alt}
            style={{width: "100%", height: "100%", objectFit: "cover", opacity: 0.88}}
          />
        </div>
      ))}
      <div style={{marginLeft: 4, maxWidth: 420}}>
        <Label style={{fontSize: 10, letterSpacing: "0.05em"}}>
          REFERENCE PHOTO / RENDER
        </Label>
        <Label style={{fontSize: 9, letterSpacing: "0.02em", marginTop: 4}}>
          MOTION SHOWN IN THE CUTAWAY, NOT THE PHOTOGRAPH
        </Label>
      </div>
    </div>
  );
};

const SceneVisual: React.FC<{scene: number; frame: number; duration: number}> = ({scene, frame, duration}) => {
  const visuals: React.ReactNode[] = [
    <PumpSystemAnimation key="pump-system" frame={frame} />,
    <RealisticTank3D key="normal-tank-3d" progress={Math.max(0, Math.min(1, frame / Math.max(1, duration - 1)))} width={820} height={560} mode="healthy" showGauge />,
    <RealisticTankComparison3D key="failed-tank-3d" />,
    <PressureSwitchMechanism key="pressure-switch" frame={frame} />,
    <MotorStressAnimation key="motor" frame={frame} />,
    <TechnicianRepairSequence key="repair" frame={frame} />,
  ];

  return (
    <div
      style={{
        ...fadeUp(frame, 11),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {visuals[scene]}
      <ReferenceStrip scene={scene} />
    </div>
  );
};

const Scene: React.FC<{
  index: number;
  frame: number;
  startFrame: number;
  totalFrames: number;
  sceneDuration: number;
}> = ({index, frame, startFrame, totalFrames, sceneDuration}) => {
  const scene = SCENES[index];
  const tone =
    index === 0 || index === 4
      ? C.red
      : index === 5
        ? C.green
        : index === 2
          ? C.amber
          : C.blue;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: C.bg,
        color: C.text,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at 50% 37%, rgba(30,58,87,0.26), transparent 58%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 7,
          background: "linear-gradient(90deg, #0B1120, #38BDF8, #0B1120)",
          opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: REELS_SAFE_AREA.top,
          bottom: REELS_SAFE_AREA.bottom,
          left: REELS_SAFE_AREA.left,
          right: REELS_SAFE_AREA.right,
          zIndex: 1,
        }}
      >
        <Header scene={index} progress={(startFrame + frame) / totalFrames} badge={scene.badge} />
        <div style={{marginTop: 18}}>
          <StatusPill text={scene.status} tone={tone} />
        </div>
        <SceneHeading title={scene.title} body={scene.body} frame={frame} />
        <div
          style={{
            marginTop: 24,
            padding: "14px 10px 12px",
            borderRadius: 28,
            background: "linear-gradient(145deg, rgba(30,41,59,0.78), rgba(15,23,42,0.8))",
            border: `1px solid ${C.border}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.24)",
          }}
        >
          <SceneVisual scene={index} frame={frame} duration={sceneDuration} />
        </div>
        <div style={{marginTop: 18}}>
          <Label color={index === 5 ? C.green : C.muted} style={{fontSize: 17}}>
            {scene.kicker}
          </Label>
        </div>
        <Footer
          text={index === 5 ? "PROTECT THE PRESSURE TANK. PROTECT THE MOTOR." : "PRESSURE TANK → SWITCH → MOTOR"}
          tone={index === 5 ? C.green : C.cyan}
        />
      </div>
    </AbsoluteFill>
  );
};

export const PumpExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const measuredSceneStartsSeconds = [7.700, 21.340, 53.920, 70.860, 80.160, 92.920];
  const boundaries = [
    0,
    ...measuredSceneStartsSeconds.slice(1).map((seconds) => Math.round(seconds * fps)),
    durationInFrames,
  ];

  return (
    <AbsoluteFill>
      {SCENES.map((_, index) => {
        const from = boundaries[index];
        const duration = boundaries[index + 1] - from;
        return (
          <Sequence key={index} from={from} durationInFrames={duration} layout="none">
            <Scene
              index={index}
              frame={frame - from}
              startFrame={from}
              totalFrames={durationInFrames}
              sceneDuration={duration}
            />
          </Sequence>
        );
      })}
      <Audio src={staticFile("voiceover.mp3")} />
    </AbsoluteFill>
  );
};
