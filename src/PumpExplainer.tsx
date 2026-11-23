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

const C = {
  bg: "#0B1120",
  card: "#1E293B",
  border: "#334155",
  text: "#F8FAFC",
  muted: "#94A3B8",
  blue: "#38BDF8",
  cyan: "#67E8F9",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#FB7185",
  copper: "#C87942",
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

const FIX_IMAGES: Array<{
  src: string;
  alt: string;
  tone: "cool" | "warm";
}> = [
  {
    src: "breaker-panel.jpg",
    alt: "Electrical breaker and disconnect panel",
    tone: "warm",
  },
  {
    src: "pressure-tank.jpg",
    alt: "Pressure tank",
    tone: "cool",
  },
  {
    src: "pressure-switch-gauge.jpg",
    alt: "Pressure switch and gauge",
    tone: "cool",
  },
];

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
    <div
      style={{
        height: 5,
        borderRadius: 9,
        background: "#334155",
        overflow: "hidden",
      }}
    >
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

const Gauge: React.FC<{value: number; label: string; color?: string}> = ({
  value,
  label,
  color = C.blue,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "baseline",
      gap: 10,
      color,
      ...mono,
      fontWeight: 800,
    }}
  >
    <span style={{fontSize: 61, letterSpacing: "-0.08em"}}>{value}</span>
    <span style={{fontSize: 23}}>{label}</span>
  </div>
);

const PressureTank: React.FC<{
  frame: number;
  waterlogged?: boolean;
}> = ({frame, waterlogged = false}) => {
  const psi = waterlogged
    ? Math.round(interpolate(frame, [0, 70, 145], [46, 18, 5], {extrapolateRight: "clamp"}))
    : Math.round(interpolate(frame, [0, 105, 190], [50, 50, 30], {extrapolateRight: "clamp"}));
  const waterTop = waterlogged
    ? interpolate(frame, [0, 150], [330, 155], {extrapolateRight: "clamp"})
    : interpolate(frame, [0, 170], [375, 260], {extrapolateRight: "clamp"});
  const bladderY = waterlogged
    ? interpolate(frame, [0, 100], [240, 338], {extrapolateRight: "clamp"})
    : interpolate(frame, [0, 170], [238, 289], {extrapolateRight: "clamp"});
  const bladderRx = waterlogged
    ? interpolate(frame, [0, 100], [108, 132], {extrapolateRight: "clamp"})
    : interpolate(frame, [0, 170], [106, 122], {extrapolateRight: "clamp"});

  return (
    <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: 36}}>
      <svg width="490" height="650" viewBox="0 0 490 650">
        <defs>
          <linearGradient id="tankMetal" x1="0" x2="1">
            <stop offset="0" stopColor="#334155" />
            <stop offset="0.5" stopColor="#475569" />
            <stop offset="1" stopColor="#1E293B" />
          </linearGradient>
          <linearGradient id="tankWater" x1="0" x2="0" y1="0" y2="1">
            <stop stopColor="#38BDF8" stopOpacity="0.86" />
            <stop offset="1" stopColor="#0369A1" stopOpacity="0.95" />
          </linearGradient>
          <clipPath id="tankClip">
            <rect x="101" y="58" width="288" height="506" rx="136" />
          </clipPath>
        </defs>
        <ellipse cx="245" cy="594" rx="184" ry="25" fill="#020617" opacity="0.65" />
        <path d="M197 42V20h96v22M215 565v41m60-41v41" fill="none" stroke="#64748B" strokeWidth="13" strokeLinecap="round" />
        <rect x="83" y="43" width="324" height="548" rx="155" fill="url(#tankMetal)" stroke="#64748B" strokeWidth="4" />
        <g clipPath="url(#tankClip)">
          <rect x="98" y={waterTop} width="294" height="360" fill="url(#tankWater)" />
          <path
            d={`M102 ${waterTop} Q148 ${waterTop - 12} 194 ${waterTop} T286 ${waterTop} T390 ${waterTop}`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="5"
            opacity="0.75"
          />
          <ellipse
            cx="245"
            cy={bladderY}
            rx={bladderRx}
            ry={waterlogged ? 90 : 94}
            fill={waterlogged ? "#475569" : "#7C3AED"}
            fillOpacity={waterlogged ? 0.78 : 0.63}
            stroke={waterlogged ? "#94A3B8" : "#C4B5FD"}
            strokeWidth="5"
          />
          <path d="M111 104h268" stroke="white" strokeOpacity="0.12" strokeWidth="8" />
        </g>
        <rect x="83" y="43" width="324" height="548" rx="155" fill="none" stroke="#94A3B8" strokeWidth="5" />
        <path d="M120 159v293" stroke="white" strokeOpacity="0.12" strokeWidth="6" strokeLinecap="round" />
        <circle cx="245" cy="18" r="13" fill="#94A3B8" />
      </svg>
      <div style={{display: "flex", flexDirection: "column", gap: 38, minWidth: 230}}>
        <div>
          <Label color={C.cyan}>LIVE TANK PRESSURE</Label>
          <Gauge value={psi} label="PSI" />
        </div>
        <div>
          <Label color={waterlogged ? C.muted : "#C4B5FD"}>AIR POCKET</Label>
          <div style={{fontSize: 26, color: C.text, marginTop: 8}}>
            {waterlogged ? "COLLAPSED" : "COMPRESSED AIR"}
          </div>
        </div>
        <div>
          <Label color={C.blue}>WATER LEVEL</Label>
          <div style={{fontSize: 26, color: C.text, marginTop: 8}}>
            {waterlogged ? "RISING" : "FALLING"}
          </div>
        </div>
      </div>
    </div>
  );
};

const PressureSwitch: React.FC<{frame: number}> = ({frame}) => {
  const isOn = Math.floor(frame / 15) % 2 === 0;
  const cycles = Math.min(99, Math.floor(frame / 9));

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 34}}>
      <svg width="700" height="410" viewBox="0 0 700 410">
        <rect x="59" y="38" width="582" height="318" rx="34" fill="#172337" stroke="#475569" strokeWidth="4" />
        <text x="350" y="86" fill="#94A3B8" fontSize="19" textAnchor="middle" fontFamily="monospace" letterSpacing="4">PRESSURE SWITCH</text>
        <circle cx="176" cy="198" r="50" fill="#0B1120" stroke="#38BDF8" strokeWidth="5" />
        <circle cx="176" cy="198" r="18" fill="#38BDF8" />
        <path d="M176 248v48m0 0h98" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round" />
        <path d="M274 296l78-91" stroke={isOn ? C.green : C.amber} strokeWidth="12" strokeLinecap="round" />
        <circle cx="352" cy="205" r="12" fill="#F8FAFC" />
        <circle cx="498" cy="205" r="12" fill="#F8FAFC" />
        <path d="M352 205H498" stroke={isOn ? C.green : "#64748B"} strokeWidth="9" strokeLinecap="round" strokeDasharray={isOn ? "0" : "12 13"} />
        <path d="M498 205h70v68" fill="none" stroke={isOn ? C.green : "#64748B"} strokeWidth="8" />
        <rect x="550" y="274" width="38" height="34" rx="6" fill={isOn ? C.green : "#475569"} />
        <text x="176" y="335" fill="#94A3B8" fontSize="15" textAnchor="middle" fontFamily="monospace">DIAPHRAGM</text>
        <text x="415" y="166" fill={isOn ? C.green : "#94A3B8"} fontSize="15" textAnchor="middle" fontFamily="monospace">{isOn ? "CONTACT CLOSED" : "CONTACT OPEN"}</text>
      </svg>
      <div style={{display: "flex", gap: 20, width: 690}}>
        <div style={{background: "#172337", border: `1px solid ${C.border}`, borderRadius: 24, padding: "23px 28px", flex: 1}}>
          <Label color={C.blue}>CUT-IN</Label>
          <Gauge value={30} label="PSI" />
        </div>
        <div style={{background: "#172337", border: `1px solid ${C.border}`, borderRadius: 24, padding: "23px 28px", flex: 1}}>
          <Label color={C.cyan}>CUT-OUT</Label>
          <Gauge value={50} label="PSI" color={C.cyan} />
        </div>
      </div>
      <div
        style={{
          background: "#2A1C2A",
          border: `1px solid ${C.red}66`,
          borderRadius: 26,
          padding: "22px 34px",
          textAlign: "center",
          minWidth: 460,
        }}
      >
        <Label color={C.red}>CYCLES / HR · SIMULATION</Label>
        <div style={{color: C.text, fontSize: 72, fontWeight: 800, lineHeight: 1.1, ...mono}}>
          {String(cycles).padStart(2, "0")}
        </div>
        <Label color={C.amber} style={{fontSize: 16}}>RAPID RESTARTS</Label>
      </div>
    </div>
  );
};

const MotorCutaway: React.FC<{frame: number}> = ({frame}) => {
  const pulse = frame % 90;
  const startup = pulse < 18;
  const amps = startup
    ? Math.round(interpolate(pulse, [0, 5, 18], [8, 46, 8], {extrapolateRight: "clamp"}))
    : 8;
  const heat = clamp(interpolate(frame, [0, 160], [0.2, 1]), 0.2, 1);
  const coil = interpolate(heat, [0.2, 1], [0, 1]);
  const coilColor = `rgb(${Math.round(200 + coil * 48)}, ${Math.round(124 - coil * 76)}, ${Math.round(66 - coil * 51)})`;
  const needleAngle = interpolate(amps, [0, 46], [-128, 48]);

  return (
    <div style={{display: "flex", flexDirection: "column", alignItems: "center", gap: 30}}>
      <svg width="760" height="435" viewBox="0 0 760 435">
        <defs>
          <linearGradient id="motorBody" x1="0" x2="1">
            <stop stopColor="#334155" />
            <stop offset="0.5" stopColor="#1E293B" />
            <stop offset="1" stopColor="#475569" />
          </linearGradient>
        </defs>
        <ellipse cx="381" cy="368" rx="315" ry="26" fill="#020617" opacity="0.62" />
        <rect x="91" y="89" width="578" height="245" rx="120" fill="url(#motorBody)" stroke="#64748B" strokeWidth="5" />
        <path d="M124 144h-40v133h40m535-133h40v133h-40" fill="#1E293B" stroke="#64748B" strokeWidth="5" />
        <rect x="181" y="132" width="396" height="159" rx="75" fill="#0B1120" stroke="#475569" strokeWidth="4" />
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i} transform={`translate(${222 + i * 75},0)`}>
            <path d="M0 166c14-38 35-38 50 0v92c-15 38-36 38-50 0z" fill="none" stroke={coilColor} strokeWidth="13" strokeLinecap="round" />
            <path d="M9 170c11-20 21-20 32 0m-32 84c11 20 21 20 32 0" fill="none" stroke="#FDE68A" strokeOpacity="0.55" strokeWidth="4" />
          </g>
        ))}
        <rect x="181" y="202" width="396" height="21" rx="10" fill="#94A3B8" />
        <circle cx="379" cy="212" r="37" fill="#334155" stroke="#CBD5E1" strokeWidth="5" />
        <path d="M379 212h287" stroke="#CBD5E1" strokeWidth="13" strokeLinecap="round" />
        <circle cx="665" cy="212" r="22" fill="#94A3B8" stroke="#E2E8F0" strokeWidth="5" />
        <text x="380" y="62" fill="#94A3B8" fontSize="18" textAnchor="middle" fontFamily="monospace" letterSpacing="4">MOTOR WINDINGS</text>
        <text x="380" y="402" fill={coilColor} fontSize="16" textAnchor="middle" fontFamily="monospace" letterSpacing="3">{heat > 0.7 ? "WINDING HEAT BUILDING" : "COPPER WINDINGS"}</text>
      </svg>
      <div style={{display: "flex", alignItems: "center", gap: 35}}>
        <svg width="260" height="220" viewBox="0 0 260 220">
          <path d="M31 159a99 99 0 1 1 198 0" fill="none" stroke="#334155" strokeWidth="20" strokeLinecap="round" />
          <path d="M31 159a99 99 0 0 1 147-87" fill="none" stroke={C.red} strokeWidth="20" strokeLinecap="round" />
          <path d={`M130 160l${Math.cos((needleAngle * Math.PI) / 180) * 74} ${Math.sin((needleAngle * Math.PI) / 180) * 74}`} stroke={C.text} strokeWidth="7" strokeLinecap="round" />
          <circle cx="130" cy="160" r="12" fill={C.text} />
          <text x="130" y="203" fill="#94A3B8" fontSize="14" textAnchor="middle" fontFamily="monospace" letterSpacing="3">AMP METER</text>
        </svg>
        <div style={{minWidth: 300}}>
          <Label color={startup ? C.red : C.cyan}>LIVE STARTUP CURRENT</Label>
          <Gauge value={amps} label="A" color={startup ? C.red : C.cyan} />
          <div style={{height: 14, width: 298, borderRadius: 10, background: "#334155", marginTop: 25, overflow: "hidden"}}>
            <div style={{width: `${20 + heat * 80}%`, height: "100%", background: `linear-gradient(90deg, ${C.copper}, ${C.red}, #FB923C)`, borderRadius: 10}} />
          </div>
          <Label color={C.amber} style={{fontSize: 16, marginTop: 10}}>WINDING TEMPERATURE</Label>
        </div>
      </div>
    </div>
  );
};

const PumpGlyph: React.FC<{frame: number}> = ({frame}) => {
  const running = Math.floor(frame / 17) % 2 === 0;
  return (
    <svg width="430" height="380" viewBox="0 0 430 380">
      <ellipse cx="214" cy="324" rx="155" ry="22" fill="#020617" opacity="0.7" />
      <path d="M82 220h78m0 0a74 74 0 1 0 148 0a74 74 0 1 0-148 0" fill="#1E293B" stroke={running ? C.cyan : "#475569"} strokeWidth="8" />
      <circle cx="234" cy="220" r="40" fill="#0B1120" stroke={running ? C.blue : "#334155"} strokeWidth="6" />
      <path d="M234 180v80m-40-40h80" stroke={running ? C.cyan : "#64748B"} strokeWidth="5" />
      <path d="M308 196h58v-91h-93" fill="none" stroke={C.blue} strokeWidth="15" strokeLinejoin="round" />
      <path d="M273 105h-66V65h66" fill="none" stroke="#64748B" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="95" cy="220" r="15" fill={running ? C.green : C.red} />
      <path d="M111 220h34" stroke="#94A3B8" strokeWidth="13" />
      <text x="234" y="344" textAnchor="middle" fill={running ? C.green : C.red} fontSize="17" fontFamily="monospace" letterSpacing="3">{running ? "PUMP ON" : "PUMP OFF"}</text>
      <circle cx="352" cy="92" r="15" fill={running ? C.cyan : "#334155"} opacity="0.9" />
    </svg>
  );
};

const FixSteps: React.FC<{frame: number}> = ({frame}) => {
  const steps = [
    ["01", "Switch off electrical supply", "ISOLATE POWER"],
    ["02", "Drain tank until pressure is zero", "0 PSI"],
    ["03", "Set air pre-charge to 28 PSI", "2 PSI BELOW CUT-IN"],
    ["04", "Replace tank if bladder is damaged", "RESTORE STORAGE"],
  ];
  return (
    <div style={{display: "flex", flexDirection: "column", gap: 18}}>
      {steps.map(([n, title, note], i) => {
        const complete = frame > (i + 1) * 20;
        return (
          <div key={n} style={{display: "flex", alignItems: "center", gap: 23, padding: "23px 27px", borderRadius: 24, background: "#172337", border: `1px solid ${complete ? `${C.green}66` : C.border}`, ...fadeUp(frame, 16 + i * 8)}}>
            <div style={{width: 61, height: 61, borderRadius: 18, display: "grid", placeItems: "center", background: complete ? `${C.green}20` : "#0B1120", color: complete ? C.green : C.cyan, fontSize: 23, fontWeight: 800, ...mono}}>{complete ? "✓" : n}</div>
            <div style={{flex: 1}}>
              <div style={{color: C.text, fontSize: 24, fontWeight: 700}}>{title}</div>
              <Label color={complete ? C.green : C.muted} style={{fontSize: 14, marginTop: 7}}>{note}</Label>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PhotoStage: React.FC<{
  src: string;
  alt: string;
  frame: number;
  width: number;
  height: number;
  tone?: "cool" | "failure" | "warm";
  children?: React.ReactNode;
}> = ({src, alt, frame, width, height, tone = "cool", children}) => {
  const pan = interpolate(frame, [0, 180], [0, -13], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tilt = interpolate(frame, [0, 180], [-1.4, 1.4], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const filter =
    tone === "failure"
      ? "brightness(0.72) saturate(0.78) sepia(0.12)"
      : tone === "warm"
        ? "brightness(0.88) saturate(1.25) sepia(0.12)"
        : "brightness(0.9) saturate(1.08)";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        flexShrink: 0,
        overflow: "hidden",
        borderRadius: 26,
        border: "1px solid rgba(148,163,184,0.42)",
        background: "#111827",
        boxShadow: "0 24px 55px rgba(0,0,0,0.42)",
        transform: `perspective(1400px) rotateY(${tilt}deg) rotateX(1deg)`,
      }}
    >
      <Img
        src={staticFile(`assets/${src}`)}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `scale(1.06) translateX(${pan}px)`,
          filter,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(4,10,19,0.04) 45%, rgba(4,10,19,0.72) 100%), radial-gradient(ellipse at 50% 30%, transparent 36%, rgba(2,8,16,0.34) 100%)",
        }}
      />
      {children}
    </div>
  );
};

const MetricCard: React.FC<{
  label: string;
  value: string;
  detail: string;
  tone?: string;
  fontSize?: number;
}> = ({label, value, detail, tone = C.cyan, fontSize = 39}) => (
  <div
    style={{
      padding: "26px 28px",
      borderRadius: 24,
      background: "rgba(12,21,35,0.92)",
      border: `1px solid ${tone}55`,
      boxShadow: "0 14px 36px rgba(0,0,0,0.24)",
    }}
  >
    <Label color={tone} style={{fontSize: 16}}>
      {label}
    </Label>
    <div
      style={{
        marginTop: 13,
        color: C.text,
        fontSize,
        fontWeight: 800,
        letterSpacing: "-0.06em",
        whiteSpace: "nowrap",
        ...mono,
      }}
    >
      {value}
    </div>
    <Label color={C.muted} style={{fontSize: 14, marginTop: 10}}>
      {detail}
    </Label>
  </div>
);

const SceneVisual: React.FC<{scene: number; frame: number}> = ({scene, frame}) => {
  const cycles = Math.round(
    interpolate(frame, [0, 400], [4, 44], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }),
  );
  const ampPhase = frame % 75;
  const amps =
    ampPhase < 22
      ? Math.round(
          interpolate(ampPhase, [0, 6, 22], [8, 46, 8], {
            extrapolateRight: "clamp",
          }),
        )
      : 8;

  const visuals: React.ReactNode[] = [
    <div key="pump" style={{width: 840}}>
      <PhotoStage
        src="pump-system.jpg"
        alt="Detailed water booster pump with metal piping and a pressure gauge"
        frame={frame}
        width={840}
        height={500}
      >
        <div
          style={{
            position: "absolute",
            left: 22,
            bottom: 22,
            display: "flex",
            gap: 12,
          }}
        >
          <StatusPill text="ON - OFF" tone={C.red} />
          <StatusPill text="REPEATING" tone={C.amber} />
        </div>
      </PhotoStage>
    </div>,
    <div key="normal-tank" style={{display: "flex", alignItems: "center", gap: 24}}>
      <PhotoStage
        src="pressure-tank.jpg"
        alt="Pressurized water expansion tank connected to plumbing"
        frame={frame}
        width={360}
        height={560}
      />
      <div style={{width: 420, display: "flex", flexDirection: "column", gap: 20}}>
        <MetricCard
          label="NORMAL PRESSURE BAND"
          value="50 PSI → 30 PSI"
          detail="PUMP CUT-OUT → CUT-IN"
          fontSize={33}
        />
        <MetricCard
          label="AIR PRE-CHARGE"
          value="28 PSI"
          detail="2 PSI BELOW THE 30 PSI CUT-IN"
          tone="#C4B5FD"
        />
      </div>
    </div>,
    <div key="failed-tank" style={{display: "flex", alignItems: "center", gap: 24}}>
      <PhotoStage
        src="pressure-tank.jpg"
        alt="Pressure tank showing its plumbing connection"
        frame={frame}
        width={360}
        height={560}
        tone="failure"
      >
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 18,
            padding: "11px 15px",
            borderRadius: 999,
            background: "rgba(74,18,31,0.88)",
            border: `1px solid ${C.red}88`,
            color: "#FFE4E6",
            ...mono,
            fontSize: 14,
            fontWeight: 800,
          }}
        >
          AIR LOSS
        </div>
      </PhotoStage>
      <div style={{width: 420, display: "flex", flexDirection: "column", gap: 20}}>
        <MetricCard
          label="BLADDER FAILURE"
          value="46 → 5 PSI"
          detail="PRESSURE COLLAPSES ON A SMALL DRAW"
          tone={C.red}
        />
        <div
          style={{
            padding: "20px 24px",
            borderRadius: 24,
            background: "rgba(12,21,35,0.92)",
            border: `1px solid ${C.red}55`,
          }}
        >
          <Label color={C.red} style={{fontSize: 15}}>
            FAST PRESSURE DROP
          </Label>
          <svg width="370" height="100" viewBox="0 0 370 100" style={{marginTop: 12}}>
            <path d="M4 13H366M4 50H366M4 87H366" stroke="#334155" strokeWidth="2" />
            <path
              d="M8 16L90 20L157 27L208 40L246 63L282 75L360 83"
              fill="none"
              stroke={C.red}
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="360" cy="83" r="8" fill={C.red} />
          </svg>
        </div>
      </div>
    </div>,
    <div key="switch" style={{display: "flex", alignItems: "center", gap: 24}}>
      <PhotoStage
        src="pressure-switch-gauge.jpg"
        alt="Mechanical pressure gauge and pressure switch on a pipe"
        frame={frame}
        width={600}
        height={450}
      />
      <MetricCard
        label="CYCLES / HR"
        value={`04 → ${String(cycles).padStart(2, "0")}`}
        detail="RAPID RESTARTS"
        tone={C.amber}
        fontSize={36}
      />
    </div>,
    <div key="motor" style={{display: "flex", alignItems: "center", gap: 24}}>
      <PhotoStage
        src="electric-motor.jpg"
        alt="Electric motor cutaway with copper stator windings"
        frame={frame}
        width={600}
        height={450}
        tone="warm"
      />
      <div style={{width: 250, display: "flex", flexDirection: "column", gap: 18}}>
        <MetricCard
          label="STARTUP CURRENT"
          value="8 A → 46 A"
          detail="5–6x INRUSH"
          tone={C.amber}
          fontSize={30}
        />
        <div
          style={{
            padding: "18px 22px",
            borderRadius: 22,
            background: "rgba(12,21,35,0.92)",
            border: `1px solid ${C.amber}55`,
          }}
        >
          <Label color={C.amber} style={{fontSize: 15}}>
            LIVE AMPS
          </Label>
          <div style={{display: "flex", alignItems: "baseline", gap: 8, marginTop: 8}}>
            <span style={{color: C.text, fontSize: 52, fontWeight: 800, ...mono}}>
              {amps}
            </span>
            <span style={{color: C.amber, fontSize: 20, ...mono}}>A</span>
          </div>
          <div
            style={{
              height: 9,
              marginTop: 8,
              borderRadius: 9,
              background: "#334155",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${(amps / 46) * 100}%`,
                height: "100%",
                background: `linear-gradient(90deg, ${C.amber}, ${C.red})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>,
    <div key="fix" style={{width: "100%"}}>
      <div style={{display: "flex", gap: 16, marginBottom: 20}}>
        {FIX_IMAGES.map(({src, alt, tone}) => (
          <PhotoStage
            key={src}
            src={src}
            alt={alt}
            frame={frame}
            width={278}
            height={176}
            tone={tone}
          />
        ))}
      </div>
      <FixSteps frame={frame} />
      <div style={{display: "flex", justifyContent: "flex-end", marginTop: 16}}>
        <StatusPill text="PROTECTED" tone={C.green} />
      </div>
    </div>,
  ];

  return (
    <div
      style={{
        ...fadeUp(frame, 11),
        minHeight: 670,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {visuals[scene]}
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
    index === 0 || index === 4 ? C.red : index === 5 ? C.green : index === 2 ? C.amber : C.blue;

  return (
    <AbsoluteFill style={{backgroundColor: C.bg, color: C.text, padding: "66px 72px", overflow: "hidden"}}>
      <div style={{position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 37%, rgba(30,58,87,0.26), transparent 58%)"}} />
      <div style={{position: "absolute", top: 0, left: 0, right: 0, height: 7, background: "linear-gradient(90deg, #0B1120, #38BDF8, #0B1120)", opacity: 0.7}} />
      <div style={{position: "relative", zIndex: 1}}>
        <Header
          scene={index}
          progress={(startFrame + frame) / totalFrames}
          badge={scene.badge}
        />
        <div style={{marginTop: 25}}>
          <StatusPill text={scene.status} tone={tone} />
        </div>
        <SceneHeading title={scene.title} body={scene.body} frame={frame} />
        <div style={{marginTop: 35, padding: "30px 26px", borderRadius: 32, background: "linear-gradient(145deg, rgba(30,41,59,0.78), rgba(15,23,42,0.8))", border: `1px solid ${C.border}`, boxShadow: "0 30px 80px rgba(0,0,0,0.24)"}}>
          <SceneVisual scene={index} frame={frame} />
        </div>
        <div style={{marginTop: 26}}>
          <Label color={index === 5 ? C.green : C.muted} style={{fontSize: 17}}>{scene.kicker}</Label>
        </div>
      </div>
      <Footer text={index === 5 ? "PROTECT THE PRESSURE TANK. PROTECT THE MOTOR." : "PRESSURE TANK → SWITCH → MOTOR"} tone={index === 5 ? C.green : C.cyan} />
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
