import {getAudioDurationInSeconds} from "@remotion/media-utils";
import {Composition, staticFile} from "remotion";
import {PumpExplainer} from "./PumpExplainer";
import {TANK_PROOF_DURATION, TANK_PROOF_FPS, Tank3DProof} from "./Tank3DProof";

const FPS = 30;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PumpExplainer"
      component={PumpExplainer}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={FPS * 60}
      calculateMetadata={async () => {
        const duration = await getAudioDurationInSeconds(
          staticFile("voiceover.mp3"),
        );

        return {durationInFrames: Math.ceil(duration * FPS)};
      }}
    />
    <Composition
      id="Tank3DProof"
      component={Tank3DProof}
      width={1080}
      height={1920}
      fps={TANK_PROOF_FPS}
      durationInFrames={TANK_PROOF_DURATION}
    />
  </>
);
