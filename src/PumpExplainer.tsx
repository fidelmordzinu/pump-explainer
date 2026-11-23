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
    body: "It may seem harmless. Repeated starts can destroy your motor over time.",
    kicker: "EVERY FEW SECONDS",
  },
  {
    badge: "HOW IT SHOULD WORK",
    status: "NORMAL",
    title: "The tank stores\npressurised water.",
    body: "A rubber bladder separates water from compressed air. The pump stops at 50 PSI and restarts at 30 PSI.",
    kicker: "AIR PRE-CHARGE · 28 PSI",
  },
  {
    badge: "THE FAILURE",
    status: "WATERLOGGED",
    title: "When the tank\nloses its air…",
    body: "A failed bladder or lost pre-charge leaves little stored pressure. Even a small draw makes PSI plunge.",
    kicker: "PRESSURE DROPS FAST",
  },
  {
    badge: "THE RESULT",
    status: "CYCLES / HR",
    title: "The switch can't\nstop clicking.",
    body: "Rapid pressure changes make the switch restart the pump far more often than designed.",
    kicker: "REPEATED RESTARTS",
  },
  {
    badge: "WHY IT MATTERS",
    status: "5–6x INRUSH",
    title: "Every start hits\nthe motor hard.",
    body: "Startup current heats the windings. Repeated heat accelerates insulation wear—and motor failure.",
    kicker: "RUN 8 A  ·  START 46 A",
  },
  {
    badge: "THE FIX",
    status: "FIXING",
    title: "Reset the tank.\nProtect the motor.",
    body: "Switch off power. Drain to zero. Set pre-charge to 28 PSI. Replace a tank with a damaged bladder.",
    kicker: "✓ PROTECTED",
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
      bottom: 69,
      left: 72,
      right: 72,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderTop: `1px solid ${C.border}`,
      paddingTop: 25,
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

const SceneVisual: React.FC<{scene: number; frame: number}> = ({scene, frame}) => {
  const visuals: React.ReactNode[] = [
    <PumpSystemAnimation key="pump-system" frame={frame} />,
    <NormalTankCycle key="normal-tank" frame={frame} />,
    <FailedTankComparison key="failed-tank" frame={frame} />,
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
}> = ({index, frame, startFrame, totalFrames}) => {
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
        padding: "66px 72px",
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
      <div style={{position: "relative", zIndex: 1}}>
        <Header scene={index} progress={(startFrame + frame) / totalFrames} badge={scene.badge} />
        <div style={{marginTop: 25}}>
          <StatusPill text={scene.status} tone={tone} />
        </div>
        <SceneHeading title={scene.title} body={scene.body} frame={frame} />
        <div
          style={{
            marginTop: 35,
            padding: "18px 10px 14px",
            borderRadius: 32,
            background: "linear-gradient(145deg, rgba(30,41,59,0.78), rgba(15,23,42,0.8))",
            border: `1px solid ${C.border}`,
            boxShadow: "0 30px 80px rgba(0,0,0,0.24)",
          }}
        >
          <SceneVisual scene={index} frame={frame} />
        </div>
        <div style={{marginTop: 26}}>
          <Label color={index === 5 ? C.green : C.muted} style={{fontSize: 17}}>
            {scene.kicker}
          </Label>
        </div>
      </div>
      <Footer
        text={index === 5 ? "PROTECT THE PRESSURE TANK. PROTECT THE MOTOR." : "PRESSURE TANK → SWITCH → MOTOR"}
        tone={index === 5 ? C.green : C.cyan}
      />
    </AbsoluteFill>
  );
};

export const PumpExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const {durationInFrames, fps} = useVideoConfig();
  const sceneStarts = [0, 16, 30, 46, 60, 76].map((seconds) =>
    Math.round(seconds * fps),
  );
  const boundaries =
    durationInFrames >= sceneStarts[sceneStarts.length - 1]
      ? [...sceneStarts, durationInFrames]
      : Array.from({length: 7}, (_, i) =>
          Math.floor((durationInFrames * i) / 6),
        );

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
            />
          </Sequence>
        );
      })}
      <Audio src={staticFile("voiceover.mp3")} />
    </AbsoluteFill>
  );
};
