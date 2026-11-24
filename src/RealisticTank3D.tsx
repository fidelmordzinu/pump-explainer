import React, {useMemo} from "react";
import {ThreeCanvas} from "@remotion/three";
import {interpolate} from "remotion";
import * as THREE from "three";

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export type TankMode = "healthy" | "lost-air" | "damaged-bladder";

type Props = {
  progress: number; // 0..1 within scene animation
  width?: number;
  height?: number;
  mode?: TankMode;
  showGauge?: boolean;
  compact?: boolean;
};

const TankModel: React.FC<{fill: number; pressure: number; mode: TankMode; showGauge: boolean}> = ({
  fill,
  pressure,
  mode,
  showGauge,
}) => {
  const shellRadius = 1.22;
  const shellHeight = 3.45;
  const innerRadius = shellRadius - 0.1;
  const bottomY = -shellHeight / 2 + 0.2;
  const topY = shellHeight / 2 - 0.24;

  const lostAir = mode === "lost-air";
  const damaged = mode === "damaged-bladder";
  const bladderMax = lostAir ? 1.35 : damaged ? 1.15 : 2.55;
  const bladderMin = lostAir ? 0.18 : damaged ? 0.35 : 0.55;
  const bladderHeight = interpolate(fill, [0, 1], [bladderMin, bladderMax]);
  const bladderRadius = interpolate(fill, [0, 1], [lostAir ? 0.28 : 0.38, lostAir ? 0.58 : damaged ? 0.55 : 0.97]);
  const waterHeight = bladderHeight * (damaged ? 0.9 : 0.96);
  const waterRadius = bladderRadius * (damaged ? 0.88 : 0.94);
  const airGap = Math.max(0.03, topY - (bottomY + bladderHeight));

  const clipPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(1, 0, 0), 0.03), []);

  const steel = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#667b8f",
        metalness: 0.96,
        roughness: 0.22,
        clearcoat: 0.45,
        clearcoatRoughness: 0.18,
        envMapIntensity: 1.0,
        clippingPlanes: [clipPlane],
        clipShadows: true,
      }),
    [clipPlane],
  );

  const innerSteel = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#13202c",
        metalness: 0.25,
        roughness: 0.9,
        side: THREE.BackSide,
        clippingPlanes: [clipPlane],
      }),
    [clipPlane],
  );

  const rubber = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: damaged ? "#7c6f7a" : "#8d95ad",
        metalness: 0.0,
        roughness: damaged ? 0.62 : 0.45,
        sheen: 0.35,
        sheenRoughness: 0.5,
        clearcoat: 0.08,
        clippingPlanes: [clipPlane],
        transparent: damaged,
        opacity: damaged ? 0.78 : 1,
      }),
    [clipPlane, damaged],
  );

  const water = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: damaged ? "#4aaed0" : "#2f9fd8",
        metalness: 0.0,
        roughness: 0.05,
        transmission: 0.5,
        transparent: true,
        opacity: 0.86,
        ior: 1.333,
        thickness: 0.9,
        clippingPlanes: [clipPlane],
      }),
    [clipPlane, damaged],
  );

  const air = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#c7c2ff",
        metalness: 0.0,
        roughness: 0.1,
        transmission: 0.92,
        transparent: true,
        opacity: lostAir ? 0.05 : 0.13,
        ior: 1.01,
        side: THREE.DoubleSide,
        depthWrite: false,
        clippingPlanes: [clipPlane],
      }),
    [clipPlane, lostAir],
  );

  const copper = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#b87333",
        metalness: 0.95,
        roughness: 0.28,
        clippingPlanes: [clipPlane],
      }),
    [clipPlane],
  );

  return (
    <>
      <color attach="background" args={["#071018"]} />
      <fog attach="fog" args={["#071018", 7, 18]} />
      <ambientLight intensity={0.5} color="#dff3ff" />
      <hemisphereLight intensity={0.45} color="#dbeafe" groundColor="#1e293b" />
      <directionalLight
        position={[6.5, 8, 5.5]}
        intensity={2.4}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        color="#ffffff"
      />
      <directionalLight position={[-4, 2.5, -4]} intensity={0.7} color="#8de3ff" />
      <pointLight position={[1.2, -1.2, 3]} intensity={14} distance={8} color="#7dd3fc" />
      <pointLight position={[-2.4, 1.6, 2.2]} intensity={10} distance={6} color="#a78bfa" />

      <group position={[0, -0.25, 0]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, -2.25, 0]} receiveShadow>
          <cylinderGeometry args={[2.5, 2.8, 0.35, 64]} />
          <meshStandardMaterial color="#0b1622" roughness={0.96} metalness={0.08} />
        </mesh>

        {/* Shell */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[shellRadius, shellRadius, shellHeight, 128, 1, true]} />
          <primitive object={steel} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow>
          <sphereGeometry args={[shellRadius, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={steel} attach="material" />
        </mesh>
        <mesh castShadow receiveShadow position={[0, -shellHeight / 2, 0]} rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[shellRadius, 128, 64, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <primitive object={steel} attach="material" />
        </mesh>
        <mesh>
          <cylinderGeometry args={[innerRadius, innerRadius, shellHeight - 0.08, 128, 1, true]} />
          <primitive object={innerSteel} attach="material" />
        </mesh>

        {/* Air around bladder (compressed air chamber) */}
        {!lostAir && (
          <mesh position={[0, bottomY + bladderHeight + airGap / 2, 0]}>
            <cylinderGeometry args={[innerRadius - 0.03, innerRadius - 0.03, Math.max(0.02, airGap - 0.04), 96, 1, true]} />
            <primitive object={air} attach="material" />
          </mesh>
        )}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[innerRadius - 0.015, innerRadius - 0.015, shellHeight - 0.2, 96, 1, true]} />
          <meshPhysicalMaterial
            color="#bdb8ff"
            transmission={0.94}
            transparent
            opacity={lostAir ? 0.02 : 0.03}
            roughness={0.2}
            ior={1.01}
            side={THREE.BackSide}
            depthWrite={false}
            clippingPlanes={[clipPlane]}
          />
        </mesh>

        {/* Bladder */}
        <mesh castShadow position={[0, bottomY + bladderHeight / 2, 0]}>
          <capsuleGeometry args={[bladderRadius, Math.max(0.08, bladderHeight - bladderRadius * 2), 20, 64]} />
          <primitive object={rubber} attach="material" />
        </mesh>

        {/* Water inside bladder */}
        <mesh position={[0, bottomY + waterHeight / 2, 0]}>
          <capsuleGeometry args={[waterRadius, Math.max(0.06, waterHeight - waterRadius * 2), 16, 48]} />
          <primitive object={water} attach="material" />
        </mesh>
        <mesh position={[0, bottomY + waterHeight - 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[waterRadius * 0.9, 64]} />
          <meshStandardMaterial
            color="#dff6ff"
            emissive="#56ccf2"
            emissiveIntensity={0.22}
            transparent
            opacity={0.28}
            clippingPlanes={[clipPlane]}
          />
        </mesh>

        {/* Damaged bladder leak cue */}
        {damaged && (
          <>
            <mesh position={[bladderRadius * 0.65, bottomY + bladderHeight * 0.45, 0.2]}>
              <sphereGeometry args={[0.08, 20, 20]} />
              <meshStandardMaterial color="#67e8f9" emissive="#38bdf8" emissiveIntensity={0.4} clippingPlanes={[clipPlane]} />
            </mesh>
            <mesh position={[bladderRadius * 0.85, bottomY + bladderHeight * 0.25, 0.18]} rotation={[0, 0, -0.4]}>
              <cylinderGeometry args={[0.03, 0.05, 0.45, 16]} />
              <meshPhysicalMaterial color="#5fd3f3" transmission={0.35} transparent opacity={0.7} roughness={0.1} clippingPlanes={[clipPlane]} />
            </mesh>
          </>
        )}

        {/* Fittings / pipe stubs */}
        <mesh position={[0, shellHeight / 2 + 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.2, 0.24, 32]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.28} clippingPlanes={[clipPlane]} />
        </mesh>
        <mesh position={[0, -shellHeight / 2 - 0.06, 0]} castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.3, 32]} />
          <meshStandardMaterial color="#8fa1ad" metalness={0.85} roughness={0.32} clippingPlanes={[clipPlane]} />
        </mesh>
        <mesh position={[0.65, -shellHeight / 2 + 0.02, 0.18]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 0.8, 24]} />
          <primitive object={copper} attach="material" />
        </mesh>
        <mesh position={[0.12, -shellHeight / 2 - 0.2, 0]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.22, 20]} />
          <meshStandardMaterial color="#c7d2d8" metalness={0.92} roughness={0.18} clippingPlanes={[clipPlane]} />
        </mesh>

        {showGauge && (
          <group position={[1.03, shellHeight / 2 - 0.48, 0.42]} rotation={[0, -0.85, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.24, 0.24, 0.09, 48]} />
              <meshStandardMaterial color="#dfe7ea" metalness={0.4} roughness={0.28} clippingPlanes={[clipPlane]} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.175, 48]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, 0.058, 0]} rotation={[Math.PI / 2, 0, -2.35 + (clamp01((pressure - 20) / 40) * 2.8)]}>
              <boxGeometry args={[0.015, 0.135, 0.01]} />
              <meshBasicMaterial color="#dc2626" />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <sphereGeometry args={[0.018, 16, 16]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
          </group>
        )}
      </group>
    </>
  );
};

export const RealisticTank3D: React.FC<Props> = ({
  progress,
  width = 1080,
  height = 1100,
  mode = "healthy",
  showGauge = true,
  compact = false,
}) => {
  const p = clamp01(progress);
  const fill = mode === "healthy"
    ? interpolate(p, [0, 0.45, 1], [0.22, 0.88, 0.22])
    : mode === "lost-air"
      ? interpolate(p, [0, 0.35, 1], [0.06, 0.18, 0.06])
      : interpolate(p, [0, 0.2, 1], [0.1, 0.24, 0.08]);
  const pressure = mode === "healthy"
    ? Math.round(interpolate(fill, [0.22, 0.88], [30, 50]))
    : mode === "lost-air"
      ? Math.round(interpolate(p, [0, 0.15, 0.35, 1], [50, 38, 30, 30]))
      : Math.round(interpolate(p, [0, 0.12, 0.3, 1], [50, 35, 30, 30]));

  return (
    <div style={{width, height, position: "relative"}}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{position: compact ? [4.0, 1.4, 4.8] : [4.3, 1.6, 5.2], fov: compact ? 36 : 34}}
        gl={{antialias: true, alpha: false}}
        onCreated={({gl}) => {
          gl.localClippingEnabled = true;
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.12;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <TankModel fill={fill} pressure={pressure} mode={mode} showGauge={showGauge} />
      </ThreeCanvas>
    </div>
  );
};

export const getTankState = (progress: number, mode: TankMode = "healthy") => {
  const p = clamp01(progress);
  const fill = mode === "healthy"
    ? interpolate(p, [0, 0.45, 1], [0.22, 0.88, 0.22])
    : mode === "lost-air"
      ? interpolate(p, [0, 0.35, 1], [0.06, 0.18, 0.06])
      : interpolate(p, [0, 0.2, 1], [0.1, 0.24, 0.08]);
  const pressure = mode === "healthy"
    ? Math.round(interpolate(fill, [0.22, 0.88], [30, 50]))
    : mode === "lost-air"
      ? Math.round(interpolate(p, [0, 0.15, 0.35, 1], [50, 38, 30, 30]))
      : Math.round(interpolate(p, [0, 0.12, 0.3, 1], [50, 35, 30, 30]));
  const pumpOn = mode === "healthy" ? p < 0.45 : p > 0.15;
  return {fill, pressure, pumpOn};
};
