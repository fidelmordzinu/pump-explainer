import React from "react";
import {interpolate} from "remotion";

const C = {
  bg: "#0B1120",
  panel: "#111C2D",
  metal: "#8293A0",
  metalLight: "#C3D0D6",
  water: "#38BDF8",
  waterDark: "#0369A1",
  air: "#A78BFA",
  green: "#34D399",
  amber: "#FBBF24",
  red: "#FB7185",
  text: "#F8FAFC",
  muted: "#94A3B8",
  copper: "#C87942",
};

const mono = "monospace";

const svgText = (
  text: string,
  x: number,
  y: number,
  color = C.muted,
  size = 14,
  anchor: "start" | "middle" | "end" = "start",
) => (
  <text
    x={x}
    y={y}
    fill={color}
    fontSize={size}
    fontFamily={mono}
    fontWeight="700"
    letterSpacing="1.5"
    textAnchor={anchor}
  >
    {text}
  </text>
);

const GaugeDial: React.FC<{
  x: number;
  y: number;
  radius: number;
  value: number;
  max?: number;
  label: string;
  tone?: string;
}> = ({x, y, radius, value, max = 60, label, tone = C.water}) => {
  const angle = -135 + (Math.max(0, Math.min(max, value)) / max) * 270;
  const radians = (angle * Math.PI) / 180;
  const needleLength = radius * 0.67;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r={radius + 7} fill="#07101B" stroke="#718391" strokeWidth="5" />
      <circle r={radius - 3} fill="#D9E1E2" stroke="#253443" strokeWidth="5" />
      {Array.from({length: 13}, (_, index) => {
        const tickAngle = ((-135 + index * 22.5) * Math.PI) / 180;
        const inner = radius * (index % 2 === 0 ? 0.68 : 0.77);
        const outer = radius * 0.83;
        return (
          <line
            key={index}
            x1={Math.cos(tickAngle) * inner}
            y1={Math.sin(tickAngle) * inner}
            x2={Math.cos(tickAngle) * outer}
            y2={Math.sin(tickAngle) * outer}
            stroke="#263746"
            strokeWidth={index % 2 === 0 ? 3 : 1.5}
          />
        );
      })}
      <path
        d={`M${-radius * 0.55} ${radius * 0.46} A${radius * 0.72} ${radius * 0.72} 0 0 1 ${radius * 0.55} ${radius * 0.46}`}
        fill="none"
        stroke="#233443"
        strokeWidth="3"
      />
      {[0, 20, 40, 60].filter((n) => n <= max).map((tick) => {
        const tickAngle = ((-135 + (tick / max) * 270) * Math.PI) / 180;
        return (
          <text
            key={tick}
            x={Math.cos(tickAngle) * radius * 0.57}
            y={Math.sin(tickAngle) * radius * 0.57 + 4}
            fill="#253443"
            fontSize={Math.max(9, radius * 0.12)}
            fontFamily={mono}
            textAnchor="middle"
          >
            {tick}
          </text>
        );
      })}
      <line
        x1="0"
        y1="0"
        x2={Math.cos(radians) * needleLength}
        y2={Math.sin(radians) * needleLength}
        stroke="#D83C44"
        strokeWidth={Math.max(3, radius * 0.055)}
        strokeLinecap="round"
      />
      <circle r={radius * 0.075} fill="#1B2B39" stroke="#EEF2F2" strokeWidth="2" />
      <text
        x="0"
        y={radius * 0.32}
        fill="#253443"
        fontFamily={mono}
        fontWeight="800"
        fontSize={Math.max(11, radius * 0.15)}
        textAnchor="middle"
      >
        {Math.round(value)}
      </text>
      <text
        x="0"
        y={radius + 23}
        fill={tone}
        fontFamily={mono}
        fontSize={Math.max(9, radius * 0.13)}
        fontWeight="700"
        letterSpacing="1"
        textAnchor="middle"
      >
        {label}
      </text>
    </g>
  );
};

const TankVessel: React.FC<{
  x: number;
  y: number;
  width: number;
  height: number;
  waterFraction: number;
  id: string;
  ruptured?: boolean;
}> = ({x, y, width, height, waterFraction, id, ruptured = false}) => {
  const inset = width * 0.105;
  const center = x + width / 2;
  const top = y + height * 0.09;
  const bottom = y + height * 0.91;
  const chamberHeight = bottom - top;
  const bagHeight = chamberHeight * (0.32 + Math.max(0, Math.min(1, waterFraction)) * 0.56);
  const bagTop = bottom - bagHeight;
  const neck = width * 0.22;
  const bagWidth = width * (0.43 + Math.max(0, Math.min(1, waterFraction)) * 0.17);
  const path = [
    `M${center - neck / 2} ${bottom}`,
    `L${center - neck / 2} ${bottom - height * 0.1}`,
    `C${center - bagWidth * 0.43} ${bottom - height * 0.16}`,
    `${center - bagWidth * 0.48} ${bagTop + height * 0.15}`,
    `${center} ${bagTop}`,
    `C${center + bagWidth * 0.48} ${bagTop + height * 0.15}`,
    `${center + bagWidth * 0.43} ${bottom - height * 0.16}`,
    `${center + neck / 2} ${bottom - height * 0.1}`,
    `L${center + neck / 2} ${bottom} Z`,
  ].join(" ");
  const waterTop = top + chamberHeight * (0.42 - waterFraction * 0.34);
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-shell`} x1="0" x2="1">
          <stop offset="0" stopColor="#263849" />
          <stop offset="0.18" stopColor="#647786" />
          <stop offset="0.35" stopColor="#2B3D4D" />
          <stop offset="0.76" stopColor="#435867" />
          <stop offset="1" stopColor="#1B2A38" />
        </linearGradient>
        <clipPath id={`${id}-inside`}>
          <rect
            x={x + inset}
            y={top}
            width={width - inset * 2}
            height={chamberHeight}
            rx={width * 0.29}
          />
        </clipPath>
        <clipPath id={`${id}-bladder`}>
          <path d={path} />
        </clipPath>
      </defs>
      <ellipse
        cx={center}
        cy={y + height * 0.96}
        rx={width * 0.47}
        ry={height * 0.025}
        fill="#02070D"
        opacity="0.72"
      />
      <rect
        x={x}
        y={y}
        width={width}
        height={height * 0.91}
        rx={width * 0.38}
        fill={`url(#${id}-shell)`}
        stroke="#A8B5BD"
        strokeWidth={Math.max(3, width * 0.018)}
      />
      <g clipPath={`url(#${id}-inside)`}>
        <rect
          x={x + inset}
          y={top}
          width={width - inset * 2}
          height={chamberHeight}
          fill="#101D2D"
        />
        {ruptured && (
          <>
            <rect
              x={x + inset}
              y={waterTop}
              width={width - inset * 2}
              height={bottom - waterTop}
              fill={C.waterDark}
              opacity="0.86"
            />
            <path
              d={`M${x + inset} ${waterTop} Q${center} ${waterTop - height * 0.018} ${x + width - inset} ${waterTop}`}
              fill="none"
              stroke="#BAE6FD"
              strokeWidth={Math.max(2, width * 0.012)}
            />
          </>
        )}
        <path d={path} fill={ruptured ? "#0B2334" : "#182438"} />
        <g clipPath={`url(#${id}-bladder)`}>
          <rect
            x={center - bagWidth * 0.6}
            y={ruptured ? waterTop : bagTop}
            width={bagWidth * 1.2}
            height={bottom - (ruptured ? waterTop : bagTop)}
            fill={C.water}
            opacity={ruptured ? 0.48 : 0.9}
          />
          <path
            d={`M${center - bagWidth} ${bagTop + 12} Q${center} ${bagTop - 8} ${center + bagWidth} ${bagTop + 12}`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth={Math.max(2, width * 0.012)}
            opacity="0.8"
          />
        </g>
        <path
          d={path}
          fill="none"
          stroke={ruptured ? "#C6A7A9" : "#C4B5FD"}
          strokeWidth={Math.max(3, width * 0.019)}
          strokeDasharray={ruptured ? "12 8 3 8" : undefined}
        />
        {ruptured && (
          <path
            d={`M${center - width * 0.07} ${bagTop + height * 0.28} l${width * 0.06} ${height * 0.04} l-${width * 0.04} ${height * 0.035} l${width * 0.08} ${height * 0.04}`}
            fill="none"
            stroke={C.red}
            strokeWidth={Math.max(4, width * 0.025)}
          />
        )}
        <path
          d={`M${x + inset + width * 0.08} ${top + height * 0.13} V${bottom - height * 0.18}`}
          fill="none"
          stroke="#E2E8F0"
          strokeOpacity="0.16"
          strokeWidth={Math.max(3, width * 0.024)}
          strokeLinecap="round"
        />
      </g>
      <path
        d={`M${center - neck / 2} ${bottom - height * 0.04} V${y + height}`}
        stroke="#8395A2"
        strokeWidth={width * 0.14}
      />
      <path
        d={`M${center - neck / 2} ${bottom - height * 0.04} V${y + height}`}
        stroke="#263746"
        strokeWidth={width * 0.08}
      />
      <path
        d={`M${center - width * 0.15} ${y + height * 0.91} h${width * 0.3} M${center - width * 0.15} ${y + height * 0.94} h${width * 0.3}`}
        stroke="#B1BDC3"
        strokeWidth={Math.max(2, width * 0.012)}
      />
      <circle
        cx={center}
        cy={y + height * 0.025}
        r={width * 0.055}
        fill="#9AAAB2"
        stroke="#D4DCE0"
        strokeWidth="2"
      />
    </g>
  );
};

export const PumpSystemAnimation: React.FC<{frame: number}> = ({frame}) => {
  const period = 78;
  const cycleFrame = frame % period;
  const onDuration = 46;
  const running = cycleFrame < onDuration;
  const onRotation =
    interpolate(cycleFrame, [0, 9], [0, 20], {extrapolateRight: "clamp"}) +
    Math.max(0, cycleFrame - 9) * 8;
  const offRotation =
    20 + (onDuration - 9) * 8 + Math.max(0, cycleFrame - onDuration) * 1.5;
  const rotation =
    Math.floor(frame / period) * (20 + (onDuration - 9) * 8 + (period - onDuration) * 1.5) +
    (running ? onRotation : offRotation);
  const tankLevel = running
    ? interpolate(cycleFrame, [0, onDuration], [0.2, 0.82], {
        extrapolateRight: "clamp",
      })
    : interpolate(cycleFrame, [onDuration, period], [0.82, 0.2], {
        extrapolateRight: "clamp",
      });
  const psi = running
    ? 30 + (cycleFrame / onDuration) * 20
    : 50 - ((cycleFrame - onDuration) / (period - onDuration)) * 20;
  const flowOffset = running ? -frame * 1.5 : 0;
  return (
    <svg viewBox="0 0 840 590" width="840" height="590">
      <defs>
        <linearGradient id="pump-case" x1="0" x2="1">
          <stop stopColor="#364958" />
          <stop offset="0.5" stopColor="#192A38" />
          <stop offset="1" stopColor="#526573" />
        </linearGradient>
        <linearGradient id="pump-motor" x1="0" x2="1">
          <stop stopColor="#253746" />
          <stop offset="0.5" stopColor="#536672" />
          <stop offset="1" stopColor="#1C2A36" />
        </linearGradient>
      </defs>
      <ellipse cx="430" cy="523" rx="370" ry="25" fill="#02070D" opacity="0.7" />
      <TankVessel
        x={384}
        y={37}
        width={154}
        height={282}
        waterFraction={tankLevel}
        id="system-tank"
      />
      {svgText("PRESSURE TANK", 461, 28, C.muted, 12, "middle")}
      <path d="M461 319V346" stroke="#879AA5" strokeWidth="25" />
      <path d="M461 319V346" stroke="#263746" strokeWidth="13" />
      <path d="M25 350H814" stroke="#263746" strokeWidth="38" strokeLinecap="round" />
      <path d="M25 350H814" stroke="#8799A3" strokeWidth="25" strokeLinecap="round" />
      <path
        d="M30 350H814"
        fill="none"
        stroke={running ? "#8DE2FF" : "#203343"}
        strokeWidth="9"
        strokeDasharray="16 24"
        strokeDashoffset={flowOffset}
        strokeLinecap="round"
      />
      <path d="M464 346V318" stroke={C.water} strokeWidth="7" strokeDasharray="10 10" strokeDashoffset={flowOffset} />
      <path d="M780 325l22 25-22 25" fill="none" stroke="#C1CDD1" strokeWidth="6" strokeLinejoin="round" />
      {svgText("TO HOUSE", 776, 402, C.muted, 12, "middle")}

      <path d="M674 349V286Q674 270 690 270H728V222" fill="none" stroke="#526571" strokeWidth="16" strokeLinejoin="round" />
      <path d="M674 349V286Q674 270 690 270H728V222" fill="none" stroke="#A1B0B5" strokeWidth="7" />
      <rect x="690" y="146" width="78" height="77" rx="12" fill="#1C2A38" stroke="#879AA5" strokeWidth="4" />
      <path d="M706 165h46M706 177h46" stroke="#526571" strokeWidth="4" />
      <path
        d={running ? "M716 192h28" : "M716 192h18"}
        stroke={running ? C.green : C.amber}
        strokeWidth="7"
        strokeLinecap="round"
      />
      <circle cx="716" cy="192" r="5" fill="#F8FAFC" />
      <circle cx="744" cy="192" r="5" fill="#F8FAFC" />
      {svgText("PRESSURE", 728, 130, C.muted, 11, "middle")}
      {svgText("SWITCH", 728, 236, C.muted, 11, "middle")}

      <path d="M70 350H115" stroke="#263746" strokeWidth="30" />
      <path d="M70 350H115" stroke="#8B9BA3" strokeWidth="18" />
      <path
        d="M105 306h114a45 45 0 0 1 0 90H105z"
        fill="url(#pump-case)"
        stroke="#AAB8BE"
        strokeWidth="5"
      />
      <path d="M110 319h31v62h-31" fill="#182632" stroke="#798C98" strokeWidth="4" />
      <circle cx="171" cy="351" r="33" fill="#111E2B" stroke="#778C98" strokeWidth="4" />
      <g transform={`rotate(${rotation} 171 351)`}>
        {[0, 1, 2, 3].map((blade) => (
          <path
            key={blade}
            d="M171 351c-8-12-5-23 4-28 10 10 10 20-4 28z"
            transform={`rotate(${blade * 90} 171 351)`}
            fill={running ? "#59D3F5" : "#455966"}
            stroke="#A9E9F8"
            strokeWidth="1.5"
          />
        ))}
        <circle cx="171" cy="351" r="6" fill="#D8E5E8" />
      </g>
      <path d="M217 326h39v-28h82" fill="none" stroke="#6D7F89" strokeWidth="17" strokeLinejoin="round" />
      <path d="M217 326h39v-28h82" fill="none" stroke="#AAB7BC" strokeWidth="8" strokeLinejoin="round" />

      <rect x="92" y="414" width="171" height="82" rx="31" fill="url(#pump-motor)" stroke="#81939D" strokeWidth="4" />
      {[0, 1, 2, 3, 4].map((line) => (
        <path key={line} d={`M${116 + line * 26} 422v65`} stroke="#9AAAB0" strokeWidth="3" opacity="0.7" />
      ))}
      <path d="M171 396v18" stroke="#C2CDD0" strokeWidth="10" />
      <circle cx="171" cy="405" r="8" fill="#DDE5E6" />
      {svgText("MOTOR", 177, 461, C.muted, 12, "middle")}
      {svgText("IMPELLER", 171, 410, running ? C.green : C.muted, 10, "middle")}
      <circle cx="304" cy="426" r="12" fill={running ? C.green : C.red} />
      {svgText(running ? "PUMP RUNNING" : "PUMP OFF", 327, 432, running ? C.green : C.red, 13)}
      {svgText(running ? "WATER MOVES →" : "FLOW STOPS", 327, 454, running ? C.water : C.muted, 11)}
      <rect x="598" y="454" width="187" height="68" rx="16" fill="#101B29" stroke="#33485A" strokeWidth="2" />
      {svgText("LIVE CYCLE", 615, 478, C.muted, 11)}
      {svgText(running ? "ON" : "OFF", 615, 507, running ? C.green : C.red, 24)}
      <GaugeDial x={741} y={487} radius={29} value={psi} label="PSI" />
    </svg>
  );
};

export const NormalTankCycle: React.FC<{frame: number}> = ({frame}) => {
  const period = 360;
  const phase = frame % period;
  const pumpOn = phase < 154;
  const fill = pumpOn
    ? interpolate(phase, [0, 154], [0.2, 0.92], {extrapolateRight: "clamp"})
    : interpolate(phase, [154, period], [0.92, 0.2], {
        extrapolateRight: "clamp",
      });
  const pressure = pumpOn
    ? 30 + (phase / 154) * 20
    : 50 - ((phase - 154) / (period - 154)) * 20;
  const displayedPressure = Math.round(pressure);
  return (
    <svg viewBox="0 0 840 620" width="840" height="620">
      <defs>
        <linearGradient id="normal-pipe" x1="0" x2="1">
          <stop stopColor="#304454" />
          <stop offset="0.5" stopColor="#A8BAC3" />
          <stop offset="1" stopColor="#304454" />
        </linearGradient>
      </defs>
      <ellipse cx="289" cy="552" rx="185" ry="22" fill="#02070D" opacity="0.7" />
      <TankVessel x={160} y={53} width={260} height={472} waterFraction={fill} id="normal-tank" />
      {svgText("SECTIONED STEEL SHELL", 290, 40, C.muted, 12, "middle")}
      {svgText("COMPRESSED AIR", 291, 124, C.air, 13, "middle")}
      {svgText(pumpOn ? "AIR VOLUME ↓" : "AIR VOLUME ↑", 291, 151, C.muted, 11, "middle")}
      {svgText("FLEXIBLE BLADDER", 292, 450, "#D5C7FF", 11, "middle")}
      {svgText("WATER IN BLADDER", 291, 478, "#D4F4FF", 12, "middle")}
      <path d="M290 525v39H590V330" fill="none" stroke="#253948" strokeWidth="27" strokeLinejoin="round" />
      <path d="M290 525v39H590V330" fill="none" stroke="url(#normal-pipe)" strokeWidth="16" strokeLinejoin="round" />
      <path d="M290 525v38H590V330" fill="none" stroke={C.water} strokeWidth="6" strokeDasharray="11 16" strokeDashoffset={pumpOn ? -frame * 1.6 : frame * 1.2} />
      <path d="M552 340l38-29 38 29" fill="none" stroke="#B8C6CC" strokeWidth="5" />
      <GaugeDial x={660} y={208} radius={65} value={displayedPressure} label="TANK PSI" />
      <rect x="511" y="73" width="260" height="59" rx="15" fill="#102033" stroke="#35516A" strokeWidth="2" />
      {svgText(pumpOn ? "PUMP ON · FILLING" : "PUMP OFF · DRAWING", 641, 98, pumpOn ? C.green : C.amber, 12, "middle")}
      {svgText(pumpOn ? "WATER ↑ / AIR COMPRESSES" : "WATER ↓ / AIR EXPANDS", 641, 119, C.text, 10, "middle")}
      <rect x="506" y="360" width="274" height="77" rx="15" fill="#101B29" stroke="#33485A" strokeWidth="2" />
      {svgText("SWITCH LOGIC", 526, 385, C.muted, 11)}
      {svgText(pressure >= 49.5 ? "50 PSI  ·  CUT OUT" : pressure <= 30.5 ? "30 PSI  ·  CUT IN" : pumpOn ? "PRESSURE RISING" : "PRESSURE FALLING", 526, 414, pressure >= 49.5 ? C.amber : C.water, 13)}
      <rect x="506" y="463" width="274" height="82" rx="15" fill="#17182D" stroke="#67519A" strokeWidth="2" />
      {svgText("SETUP VALUE ONLY", 526, 489, C.air, 11)}
      {svgText("28 PSI PRE-CHARGE", 526, 520, C.text, 17)}
      {svgText("measure with tank drained · 0 PSI water", 526, 537, C.muted, 9)}
      <path d="M472 89v-22h-30" fill="none" stroke={C.air} strokeWidth="2" />
      <circle cx="472" cy="89" r="4" fill={C.air} />
      <rect x="128" y="576" width="538" height="29" rx="14" fill="#102235" />
      <rect x="128" y="576" width={`${538 * (pressure / 60)}`} height="29" rx="14" fill={C.water} opacity="0.7" />
      {svgText("PRESSURE", 143, 596, C.text, 9)}
      {svgText("30 PSI CUT-IN", 242, 596, C.muted, 9)}
      {svgText("50 PSI CUT-OUT", 555, 596, C.muted, 9)}
    </svg>
  );
};

export const FailedTankComparison: React.FC<{frame: number}> = ({frame}) => {
  const pressure = Math.round(
    interpolate(frame, [0, 150, 340], [46, 22, 5], {
      extrapolateRight: "clamp",
    }),
  );
  const waterDraw = interpolate(frame, [0, 340], [0, 1], {
    extrapolateRight: "clamp",
  });
  const lostFill = interpolate(frame, [0, 340], [0.34, 0.12], {
    extrapolateRight: "clamp",
  });
  const graphX = 546 + waterDraw * 240;
  const graphY = 417 + waterDraw * 45;
  return (
    <svg viewBox="0 0 840 620" width="840" height="620">
      <ellipse cx="200" cy="481" rx="103" ry="14" fill="#02070D" opacity="0.68" />
      <ellipse cx="426" cy="481" rx="103" ry="14" fill="#02070D" opacity="0.68" />
      <TankVessel x={116} y={96} width={170} height={354} waterFraction={lostFill} id="lost-air-tank" />
      <TankVessel x={341} y={96} width={170} height={354} waterFraction={0.57} id="ruptured-tank" ruptured />
      {svgText("A · LOST PRE-CHARGE", 201, 72, C.amber, 13, "middle")}
      {svgText("SMALL AIR CUSHION", 201, 470, C.muted, 10, "middle")}
      {svgText("B · DAMAGED BLADDER", 426, 72, C.red, 13, "middle")}
      {svgText("BLADDER LETS WATER THROUGH", 426, 470, C.muted, 10, "middle")}
      <path d="M201 451v42h49" fill="none" stroke="#536775" strokeWidth="12" />
      <path d="M201 451v42h49" fill="none" stroke={C.water} strokeWidth="5" strokeDasharray="8 12" strokeDashoffset={-frame * 1.8} />
      <path d="M426 451v42h49" fill="none" stroke="#536775" strokeWidth="12" />
      <path d="M426 451v42h49" fill="none" stroke={C.water} strokeWidth="5" strokeDasharray="8 12" strokeDashoffset={-frame * 1.8} />
      {[0, 1, 2].map((drop) => {
        const dy = (frame * 2 + drop * 37) % 115;
        return <circle key={drop} cx={246 + drop * 15} cy={390 + dy * 0.35} r="4" fill={C.water} opacity={dy < 70 ? 0.9 : 0} />;
      })}
      <rect x="524" y="64" width="281" height="480" rx="24" fill="#101B29" stroke="#33485A" strokeWidth="2" />
      {svgText("SMALL DRAW · ILLUSTRATION", 547, 95, C.muted, 11)}
      <GaugeDial x={665} y={216} radius={91} value={pressure} label="PRESSURE PSI" tone={C.red} />
      {svgText("46 PSI", 548, 354, C.text, 13)}
      {svgText("5 PSI", 790, 354, C.red, 13, "end")}
      <path d="M546 462H786M546 406V462" stroke="#445563" strokeWidth="2" />
      <path d="M546 414H786" stroke="#283A48" strokeWidth="2" strokeDasharray="5 7" />
      <path d={`M546 417 L${graphX} ${graphY}`} fill="none" stroke={C.red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={graphX} cy={graphY} r="8" fill={C.red} stroke="#FFE4E6" strokeWidth="2" />
      <circle cx="546" cy="417" r="5" fill={C.amber} />
      <circle cx="786" cy="462" r="5" fill={C.red} />
      {svgText("WATER DRAW →", 661, 493, C.water, 10, "middle")}
      {svgText("TIME", 790, 480, C.muted, 9, "end")}
      <rect x="545" y="509" width="239" height="23" rx="11" fill="#391D2B" />
      {svgText("BOTH CONDITIONS REDUCE STORAGE", 664, 525, "#FFDCE2", 9, "middle")}
    </svg>
  );
};

export const PressureSwitchMechanism: React.FC<{frame: number}> = ({frame}) => {
  const period = 150;
  const phase = frame % period;
  const cutInToCutOut = 75;
  const running = phase < cutInToCutOut;
  const pressure = running
    ? 30 + (phase / cutInToCutOut) * 20
    : 50 - ((phase - cutInToCutOut) / (period - cutInToCutOut)) * 20;
  const diaphragmTravel = interpolate(pressure, [30, 50], [0, 24]);
  const leverAngle = running ? -8 + (pressure - 30) * 0.42 : 5 - (50 - pressure) * 0.2;
  const cyclesPerHour = Math.min(99, 4 + Math.floor(frame / 10));
  return (
    <svg viewBox="0 0 840 620" width="840" height="620">
      <defs>
        <linearGradient id="switch-case" x1="0" x2="1">
          <stop stopColor="#334756" />
          <stop offset="0.5" stopColor="#152431" />
          <stop offset="1" stopColor="#405361" />
        </linearGradient>
      </defs>
      <path d="M76 519H761" stroke="#263846" strokeWidth="35" strokeLinecap="round" />
      <path d="M76 519H761" stroke="#8396A1" strokeWidth="20" strokeLinecap="round" />
      <path d="M280 519v-72q0-20 20-20h35" fill="none" stroke="#7C8F99" strokeWidth="17" />
      <path d="M280 519v-72q0-20 20-20h35" fill="none" stroke={C.water} strokeWidth="6" strokeDasharray="10 12" strokeDashoffset={-frame * 1.5} />
      <rect x="235" y="448" width="90" height="20" rx="8" fill="#93A5AD" stroke="#E2E8EA" strokeWidth="2" />
      <path d="M246 452v12m14-12v12m14-12v12m14-12v12m14-12v12m14-12v12" stroke="#435663" strokeWidth="2" />
      <path
        d={`M229 ${425 + diaphragmTravel} Q280 ${397 + diaphragmTravel} 331 ${425 + diaphragmTravel} L322 ${447 + diaphragmTravel} Q280 ${466 + diaphragmTravel} 238 ${447 + diaphragmTravel} Z`}
        fill="#374B59"
        stroke={C.water}
        strokeWidth="4"
      />
      <path d={`M238 ${440 + diaphragmTravel} Q280 ${462 + diaphragmTravel} 322 ${440 + diaphragmTravel}`} fill="none" stroke="#A9DDF0" strokeWidth="3" />
      {svgText("PRESSURE INLET", 280, 565, C.water, 11, "middle")}
      {svgText("SENSING DIAPHRAGM", 280, 391 + diaphragmTravel, C.muted, 10, "middle")}

      <rect x="102" y="147" width="638" height="265" rx="26" fill="url(#switch-case)" stroke="#91A2AB" strokeWidth="4" />
      <rect x="118" y="163" width="606" height="233" rx="19" fill="#0E1926" stroke="#475C69" strokeWidth="2" />
      {svgText("COVER REMOVED · MECHANISM VIEW", 420, 188, C.muted, 11, "middle")}

      <circle cx="396" cy="324" r="12" fill="#DCE5E7" stroke="#52636E" strokeWidth="4" />
      <g transform={`rotate(${leverAngle} 396 324)`}>
        <path d="M280 430L396 324L583 289" fill="none" stroke="#B5C2C7" strokeWidth="14" strokeLinecap="round" />
        <path d="M280 430L396 324L583 289" fill="none" stroke="#40515B" strokeWidth="4" strokeLinecap="round" />
        <path d="M306 407l49-44" stroke="#DCE5E7" strokeWidth="4" />
      </g>
      {svgText("LINKAGE / LEVER", 357, 278, C.muted, 10, "middle")}

      <path d="M437 222v22m-13 0h26l-13 16 13 16-13 16 13 16-13 16" fill="none" stroke={C.amber} strokeWidth="5" strokeLinejoin="round" />
      <path d="M437 310v22" stroke={C.amber} strokeWidth="5" />
      <circle cx="437" cy="335" r="9" fill="#D9E0E2" stroke="#63737C" strokeWidth="3" />
      {svgText("ADJUSTMENT SPRING", 473, 239, C.amber, 10)}
      <path d="M437 219V208" stroke="#8597A0" strokeWidth="7" />
      <rect x="416" y="199" width="42" height="9" rx="4" fill="#D3DADC" />

      <rect x="582" y="218" width="105" height="108" rx="14" fill="#142331" stroke="#6B7E89" strokeWidth="3" />
      <path d="M599 243v46h29m42-46v46h-29" fill="none" stroke="#A6B4BA" strokeWidth="8" strokeLinecap="round" />
      <circle cx="628" cy="289" r="8" fill={running ? C.green : "#E8EDF0"} stroke="#263846" strokeWidth="3" />
      <circle cx="641" cy="289" r="8" fill={running ? C.green : "#E8EDF0"} stroke="#263846" strokeWidth="3" />
      {running ? (
        <path d="M628 289h13" stroke={C.green} strokeWidth="7" strokeLinecap="round" />
      ) : (
        <path d="M628 289h13" stroke={C.red} strokeWidth="4" strokeDasharray="3 5" />
      )}
      <path d="M604 243V210h-42m74 79v33h-40v-32m45-10v-43h47" fill="none" stroke={running ? C.green : "#687A85"} strokeWidth="5" />
      {svgText("ELECTRICAL CONTACTS", 635, 350, C.muted, 9, "middle")}
      {svgText(running ? "CLOSED · MOTOR ON" : "OPEN · MOTOR OFF", 635, 372, running ? C.green : C.amber, 9, "middle")}
      <circle cx="562" cy="210" r="8" fill="#D9A854" stroke="#FDE68A" strokeWidth="2" />
      <circle cx="646" cy="210" r="8" fill="#D9A854" stroke="#FDE68A" strokeWidth="2" />
      {svgText("TERMINALS", 604, 207, C.muted, 9, "middle")}

      <GaugeDial x={175} y={270} radius={69} value={pressure} label="SYSTEM PSI" />
      <rect x="535" y="446" width="220" height="124" rx="18" fill="#101B29" stroke="#394E5D" strokeWidth="2" />
      {svgText("HYSTERESIS CONTROL", 555, 468, C.muted, 10)}
      {svgText(running ? "PUMP ON" : "PUMP OFF", 555, 496, running ? C.green : C.amber, 18)}
      {svgText("30 PSI IN  ·  50 PSI OUT", 555, 516, C.text, 8)}
      {svgText(`${String(cyclesPerHour).padStart(2, "0")} / HR`, 555, 543, C.amber, 17)}
      {svgText("ILLUSTRATIVE SHORT-CYCLE RATE", 555, 559, C.muted, 8)}
      {svgText("30 PSI CUT-IN", 280, 596, C.water, 10, "middle")}
      {svgText("50 PSI CUT-OUT", 561, 596, C.amber, 10, "middle")}
      <path d="M143 439v49h59" fill="none" stroke="#526571" strokeWidth="9" />
      {svgText("PRESSURE PORT", 150, 505, C.muted, 9)}
    </svg>
  );
};

export const MotorStressAnimation: React.FC<{frame: number}> = ({frame}) => {
  const period = 96;
  const phase = frame % period;
  const startDuration = 10;
  const runEnd = 66;
  const running = phase < runEnd;
  const amps = phase < startDuration
    ? interpolate(phase, [0, 2, startDuration], [0, 46, 8], {
        extrapolateRight: "clamp",
      })
    : running
      ? 8
      : 0;
  const temperature = interpolate(frame, [0, 450], [0.16, 0.94], {
    extrapolateRight: "clamp",
  });
  const heat = Math.max(0, Math.min(1, temperature));
  const windingColor = `rgb(${Math.round(174 + heat * 76)}, ${Math.round(108 - heat * 72)}, ${Math.round(57 - heat * 44)})`;
  const angularSpeed = phase < startDuration
    ? interpolate(phase, [0, startDuration], [0, 1], {extrapolateRight: "clamp"})
    : running ? 1 : 0;
  const rotorAngle =
    Math.floor(frame / period) * runEnd * 12 +
    Math.min(phase, runEnd) * 12 * angularSpeed;
  const needle = -135 + (amps / 50) * 270;
  return (
    <svg viewBox="0 0 840 620" width="840" height="620">
      <defs>
        <linearGradient id="motor-shell" x1="0" x2="1">
          <stop stopColor="#324552" />
          <stop offset="0.2" stopColor="#8799A1" />
          <stop offset="0.4" stopColor="#263746" />
          <stop offset="0.78" stopColor="#657984" />
          <stop offset="1" stopColor="#1C2C3A" />
        </linearGradient>
        <radialGradient id="motor-heat">
          <stop stopColor="#FB923C" stopOpacity={heat * 0.34} />
          <stop offset="1" stopColor="#FB923C" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="414" cy="465" rx="349" ry="26" fill="#02070D" opacity="0.7" />
      <path d="M111 396h603l57 56H64z" fill="#293A46" stroke="#8A9AA2" strokeWidth="3" />
      <path d="M179 386h75l-18 25h-75zm425 0h75l18 25h-75z" fill="#586973" stroke="#AAB6BA" strokeWidth="3" />

      <rect x="122" y="170" width="596" height="242" rx="117" fill="url(#motor-shell)" stroke="#BDCACD" strokeWidth="5" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((fin) => (
        <path key={fin} d={`M${236 + fin * 30} 180v222`} stroke="#B2C0C3" strokeWidth="5" opacity="0.62" />
      ))}
      <ellipse cx="152" cy="291" rx="52" ry="105" fill="#283B49" stroke="#CAD3D5" strokeWidth="6" />
      <ellipse cx="152" cy="291" rx="35" ry="82" fill="#111E2B" stroke="#758892" strokeWidth="4" />
      <ellipse cx="692" cy="291" rx="48" ry="103" fill="#344957" stroke="#B5C2C6" strokeWidth="6" />
      <ellipse cx="692" cy="291" rx="29" ry="73" fill="#111E2B" stroke="#738791" strokeWidth="4" />
      <rect x="235" y="201" width="371" height="181" rx="78" fill="#0B1420" stroke="#A4B3B9" strokeWidth="5" />
      <rect x="249" y="214" width="343" height="155" rx="64" fill={`url(#motor-heat)`} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((coil) => {
        const x = 270 + coil * 36;
        return (
          <g key={coil}>
            <path
              d={`M${x} 236c-20 25-20 91 0 112m12-112c20 25 20 91 0 112`}
              fill="none"
              stroke="#5B2D23"
              strokeWidth="15"
              strokeLinecap="round"
            />
            <path
              d={`M${x} 236c-20 25-20 91 0 112m12-112c20 25 20 91 0 112`}
              fill="none"
              stroke={windingColor}
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path d={`M${x - 3} 242v98`} stroke="#FFE4A8" strokeOpacity={0.35 + heat * 0.4} strokeWidth="2" />
          </g>
        );
      })}
      <g transform={`rotate(${rotorAngle} 421 291)`}>
        <rect x="312" y="269" width="218" height="44" rx="20" fill="#82939C" stroke="#E0E6E7" strokeWidth="4" />
        <path d="M326 275v32m18-32v32m18-32v32m18-32v32m18-32v32m18-32v32m18-32v32m18-32v32m18-32v32" stroke="#344653" strokeWidth="4" />
        <circle cx="421" cy="291" r="39" fill="#435563" stroke="#CDD7DA" strokeWidth="5" />
        <path d="M421 253v76m-38-38h76" stroke="#7B8E98" strokeWidth="5" />
      </g>
      <path d="M421 291H756" stroke="#D3DDDF" strokeWidth="13" strokeLinecap="round" />
      <circle cx="749" cy="291" r="22" fill="#71848E" stroke="#E0E7E8" strokeWidth="5" />
      <circle cx="519" cy="291" r="42" fill="none" stroke="#A1B0B5" strokeWidth="7" />
      {svgText("STATOR + COPPER WINDINGS", 420, 147, C.text, 13, "middle")}
      {svgText("ROTOR · SHAFT", 421, 352, C.muted, 11, "middle")}
      {svgText("BEARING", 749, 333, C.muted, 9, "middle")}
      {svgText(running ? "ROTOR ACCELERATING / RUNNING" : "ROTOR COASTS TO REST", 420, 434, running ? C.green : C.amber, 11, "middle")}

      <rect x="67" y="488" width="284" height="94" rx="18" fill="#111C2B" stroke="#3B5060" strokeWidth="2" />
      <path d="M99 548a36 36 0 0 1 72 0" fill="none" stroke="#465765" strokeWidth="9" />
      <path d="M99 548a36 36 0 0 1 58-31" fill="none" stroke={amps > 30 ? C.red : C.amber} strokeWidth="9" />
      <line
        x1="135"
        y1="548"
        x2={135 + Math.cos((needle * Math.PI) / 180) * 29}
        y2={548 + Math.sin((needle * Math.PI) / 180) * 29}
        stroke="#F8FAFC"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <circle cx="135" cy="548" r="5" fill="#F8FAFC" />
      {svgText("CURRENT", 135, 571, C.muted, 9, "middle")}
      {svgText(`${Math.round(amps)} A`, 197, 531, amps > 30 ? C.red : C.text, 22)}
      {svgText("illustrative", 197, 553, C.muted, 9)}

      <rect x="383" y="488" width="389" height="94" rx="18" fill="#111C2B" stroke="#3B5060" strokeWidth="2" />
      {svgText("WINDING THERMAL STRESS", 405, 516, C.muted, 10)}
      <rect x="405" y="532" width="339" height="20" rx="10" fill="#273A49" />
      <rect x="405" y="532" width={`${339 * heat}`} height="20" rx="10" fill={windingColor} />
      <path d={`M${420 + frame % 28} 545 q-10-19 0-29 q10 10 0 29`} fill="none" stroke="#FFD38B" strokeWidth="2" opacity={heat * 0.8} />
      {svgText("REPEATED STARTS ADD HEAT", 405, 573, heat > 0.68 ? C.red : C.amber, 10)}
    </svg>
  );
};

export const TechnicianRepairSequence: React.FC<{frame: number}> = ({frame}) => {
  const isolated = frame >= 45;
  const drained = frame >= 177;
  const adjusting = frame >= 220 && frame < 344;
  const replacing = frame >= 344 && frame < 410;
  const restored = frame >= 410;
  const pressure = !drained
    ? interpolate(frame, [0, 177], [42, 0], {extrapolateRight: "clamp"})
    : adjusting
      ? 0
      : restored
        ? 38
        : 0;
  const air =
    frame >= 335
      ? 28
      : adjusting
        ? interpolate(frame, [220, 335], [0, 28], {extrapolateRight: "clamp"})
        : 0;
  const airNeedle = -135 + (air / 60) * 270;
  const tankWaterTop = pressure <= 0 ? 380 : 380 - (Math.min(pressure, 42) / 42) * 100;
  const repairSteps: Array<[string, string, boolean]> = [
    ["01", "ISOLATE", isolated],
    ["02", "DRAIN TO 0", drained],
    ["03", "SET 28 PSI", adjusting || replacing || restored],
    ["04", "REPLACE IF DAMAGED", replacing || restored],
  ];
  return (
    <>
      <svg viewBox="0 0 840 520" width="840" height="520">
        <defs>
          <linearGradient id="repair-tank-shell" x1="0" x2="1">
            <stop stopColor="#263948" />
            <stop offset="0.35" stopColor="#687C86" />
            <stop offset="0.7" stopColor="#344956" />
            <stop offset="1" stopColor="#1C2B38" />
          </linearGradient>
        </defs>
        <ellipse cx="419" cy="454" rx="341" ry="19" fill="#02070D" opacity="0.7" />
        <rect x="76" y="85" width="688" height="318" rx="24" fill="#111B29" stroke="#344958" strokeWidth="2" />

        <rect x="110" y="127" width="112" height="145" rx="13" fill="#293A46" stroke="#9AA9AF" strokeWidth="4" />
        <rect x="124" y="143" width="84" height="111" rx="8" fill="#111B26" stroke="#556873" strokeWidth="2" />
        <path d="M153 180h27v40h-27z" fill={isolated ? "#22362F" : "#562532"} stroke={isolated ? C.green : C.red} strokeWidth="3" />
        <path d={`M${isolated ? 153 : 180} 190l14 11`} stroke="#EEF2F3" strokeWidth="7" strokeLinecap="round" />
        <circle cx="139" cy="158" r="4" fill="#D6DFE2" />
        <circle cx="193" cy="158" r="4" fill="#D6DFE2" />
        {svgText("DISCONNECT", 166, 296, C.muted, 9, "middle")}
        {svgText(isolated ? "LOCKED OFF" : "LIVE", 166, 316, isolated ? C.green : C.red, 11, "middle")}
        <rect x="111" y="325" width="112" height="35" rx="9" fill="#172735" stroke="#526674" strokeWidth="2" />
        {svgText(isolated ? "VERIFY · 0 V" : "TEST SUPPLY", 167, 347, isolated ? C.green : C.amber, 9, "middle")}
        <path d="M229 180h45" stroke="#84969E" strokeWidth="8" />
        <circle cx="273" cy="180" r="5" fill="#D9E1E3" />

        <rect x="329" y="89" width="177" height="313" rx="84" fill="url(#repair-tank-shell)" stroke="#B7C3C7" strokeWidth="4" />
        <rect x="348" y="110" width="139" height="270" rx="65" fill="#101D2B" stroke="#71838D" strokeWidth="3" />
        <path d="M417 376v29h49" stroke="#8899A0" strokeWidth="19" />
        <path d="M417 376v29h49" stroke="#243746" strokeWidth="9" />
        <path d={`M348 ${tankWaterTop}h139v${380 - tankWaterTop}H348z`} fill={restored ? C.waterDark : "#12618A"} opacity="0.9" />
        {pressure > 0 && (
          <path
            d={`M348 ${tankWaterTop}q34-9 69 0t70 0`}
            fill="none"
            stroke="#BAE6FD"
            strokeWidth="4"
          />
        )}
        <path d="M417 376v29h49" fill="none" stroke={drained ? "#40515D" : C.water} strokeWidth="5" strokeDasharray={drained ? "0" : "8 11"} strokeDashoffset={-frame * 1.5} />
        <circle cx="466" cy="423" r={drained ? 0 : 6} fill={C.water} />
        {svgText("TANK", 417, 160, C.text, 13, "middle")}
        {svgText(drained ? "WATER SIDE ZERO" : "DRAINING", 417, 339, drained ? C.green : C.water, 9, "middle")}
        <rect x="394" y="71" width="46" height="20" rx="7" fill="#738791" stroke="#CAD4D7" strokeWidth="2" />
        <path d="M417 71V62h23" stroke="#9AAAB1" strokeWidth="6" />
        <path d="M437 62h26" stroke="#9AAAB1" strokeWidth="6" />
        <circle cx="464" cy="62" r="5" fill="#E0E6E7" />

        <path d="M465 405H546V237h46" fill="none" stroke="#455965" strokeWidth="11" />
        <path d="M465 405H546V237h46" fill="none" stroke="#B6C2C6" strokeWidth="4" />
        <circle cx="586" cy="237" r="49" fill="#D9E1E2" stroke="#81939C" strokeWidth="7" />
        <circle cx="586" cy="237" r="37" fill="#EFF2EF" stroke="#273A47" strokeWidth="3" />
        <path d={`M586 237l${Math.cos((airNeedle * Math.PI) / 180) * 27} ${Math.sin((airNeedle * Math.PI) / 180) * 27}`} stroke="#D73C45" strokeWidth="4" strokeLinecap="round" />
        <circle cx="586" cy="237" r="5" fill="#273A47" />
        {svgText("AIR TEST GAUGE", 586, 310, C.air, 9, "middle")}
        {svgText(`${Math.round(air)} PSI`, 586, 333, C.text, 15, "middle")}
        {svgText("CONNECT ONLY WHEN DRAINED", 586, 353, C.muted, 8, "middle")}

        <rect x="653" y="132" width="84" height="72" rx="14" fill={pressure === 0 ? "#12291F" : "#1B2936"} stroke={pressure === 0 ? C.green : "#6F818A"} strokeWidth="3" />
        <path d="M672 168h46" stroke="#314553" strokeWidth="5" />
        <path d="M675 168h37" stroke={pressure === 0 ? C.green : C.water} strokeWidth="5" />
        <circle cx="675" cy="168" r="5" fill="#E4EAEB" />
        <path d={`M675 168l${Math.cos(((-135 + (pressure / 60) * 270) * Math.PI) / 180) * 22} ${Math.sin(((-135 + (pressure / 60) * 270) * Math.PI) / 180) * 22}`} stroke="#D83C44" strokeWidth="4" strokeLinecap="round" />
        {svgText(`${Math.round(pressure)} PSI`, 695, 231, pressure === 0 ? C.green : C.text, 13, "middle")}
        {svgText("WATER PRESSURE", 695, 249, C.muted, 8, "middle")}

        {adjusting && (
          <g>
            <path d="M464 62h38q16 0 16 16v49h19" fill="none" stroke={C.air} strokeWidth="5" />
            <rect x="511" y="112" width="32" height="27" rx="8" fill="#3C3470" stroke="#C4B5FD" strokeWidth="3" />
            <path d="M523 124h17" stroke="#E9D5FF" strokeWidth="3" />
            {svgText("AIR ADDED", 527, 161, C.air, 9, "middle")}
          </g>
        )}
        {replacing && (
          <g>
            <path d="M554 389h115" stroke={C.red} strokeWidth="4" strokeDasharray="8 6" />
            <rect x="650" y="335" width="79" height="100" rx="36" fill="#354955" stroke="#A8B8BE" strokeWidth="3" />
            <path d="M690 435v13" stroke="#82939A" strokeWidth="8" />
            {svgText("REPLACE", 689, 468, C.red, 9, "middle")}
          </g>
        )}
        {restored && (
          <g>
            <path d="M595 404h131" stroke="#7E929C" strokeWidth="12" />
            <path d="M595 404h131" stroke={C.water} strokeWidth="4" strokeDasharray="8 12" strokeDashoffset={-frame * 1.5} />
            <circle cx="729" cy="404" r="9" fill={C.green} />
            {svgText("STABLE · NO RAPID RESTART", 657, 438, C.green, 9, "middle")}
          </g>
        )}
        {frame < 70 && (
          <g>
            <path d="M253 336Q224 293 210 235" fill="none" stroke="#536775" strokeWidth="22" strokeLinecap="round" />
            <path d="M253 336Q224 293 210 235" fill="none" stroke="#A8B5BA" strokeWidth="11" strokeLinecap="round" />
            <path d="M203 235q-7-10 1-17l8-5q8-2 12 6l7 12q4 9-5 15l-9 4q-9 1-14-7z" fill="#6BA8C3" stroke="#D7EBF0" strokeWidth="3" />
            <path d="M211 220l-4-10m11 10-1-12m8 15 4-9" stroke="#D7EBF0" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}
        {adjusting && (
          <g>
            <path d="M555 181Q547 162 538 143" fill="none" stroke="#536775" strokeWidth="18" strokeLinecap="round" />
            <path d="M555 181Q547 162 538 143" fill="none" stroke="#A8B5BA" strokeWidth="9" strokeLinecap="round" />
            <path d="M531 143q-6-9 2-15l8-4q8-1 11 6l5 10q3 8-5 13l-8 3q-8 0-13-7z" fill="#6BA8C3" stroke="#D7EBF0" strokeWidth="3" />
            <path d="M539 127l-3-8m11 8v-9m7 12 4-7" stroke="#D7EBF0" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        <rect x="97" y="473" width="646" height="31" rx="15" fill="#182638" />
        {svgText(
          !isolated ? "01  ISOLATE + VERIFY DE-ENERGISED" :
            !drained ? "02  DRAIN · WATCH WATER PRESSURE REACH ZERO" :
              adjusting ? "03  EMPTY TANK · SET AIR TO 28 PSI" :
                replacing ? "BLADDER DAMAGED? REPLACE THE TANK" :
                  restored ? "SYSTEM RESTORED · PRESSURE CYCLE NORMAL" :
                    "PRE-CHARGE IS NOT A BLADDER REPAIR",
          420,
          494,
          !isolated ? C.amber : replacing ? C.red : C.green,
          10,
          "middle",
        )}
        <path d="M224 220h54v117h50" fill="none" stroke={isolated ? "#435562" : C.red} strokeWidth="3" strokeDasharray="7 7" />
        {svgText("VERIFY POWER OFF BEFORE DRAINING", 166, 382, C.amber, 8, "middle")}
      </svg>
      <div style={{display: "flex", gap: 9, marginTop: 4}}>
        {repairSteps.map(([number, text, complete]) => (
          <div
            key={number}
            style={{
              flex: 1,
              minWidth: 0,
              padding: "13px 10px",
              textAlign: "center",
              borderRadius: 13,
              background: complete ? "rgba(52,211,153,0.12)" : "#111C2B",
              border: `1px solid ${complete ? "rgba(52,211,153,0.4)" : "#334155"}`,
              color: complete ? C.green : C.muted,
              fontFamily: mono,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.05em",
            }}
          >
            {number} · {text}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 12,
          padding: "11px 16px",
          borderRadius: 12,
          background: "rgba(251,191,36,0.1)",
          border: "1px solid rgba(251,191,36,0.34)",
          color: "#FDE68A",
          fontFamily: mono,
          fontSize: 12,
          fontWeight: 700,
          textAlign: "center",
          letterSpacing: "0.04em",
        }}
      >
        NEVER REMOVE A FITTING UNTIL WATER-SIDE PRESSURE IS ZERO · DO NOT OPEN LIVE ELECTRICAL EQUIPMENT
      </div>
    </>
  );
};
