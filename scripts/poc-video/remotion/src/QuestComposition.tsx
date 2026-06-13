import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { ScriptData } from "./types";
import { QuestCoverScene } from "./scenes/quest/QuestCoverScene";
import { QuestPointScene } from "./scenes/quest/QuestPointScene";
import { QuestHookScene } from "./scenes/quest/QuestHookScene";

type Props = {
  script: ScriptData;
  audioFiles: string[];
};

const FPS = 30;

function sceneDurationFrames(durationSec: number): number {
  return Math.ceil(durationSec * FPS);
}

export const QuestVideoComposition: React.FC<Props> = ({ script, audioFiles }) => {
  let offset = 0;
  const pointIndex = { current: 0 };
  const totalPoints = script.scenes.filter(s => s.kind === "point").length;

  return (
    <AbsoluteFill>
      {script.scenes.map((scene, i) => {
        const durationFrames = sceneDurationFrames(scene.durationSec);
        const from = offset;
        offset += durationFrames;

        const audioFile = audioFiles[i];

        let sceneEl: React.ReactNode;
        if (scene.kind === "cover") {
          sceneEl = <QuestCoverScene caption={scene.caption} />;
        } else if (scene.kind === "hook") {
          sceneEl = <QuestHookScene caption={scene.caption} />;
        } else {
          const idx = pointIndex.current++;
          sceneEl = (
            <QuestPointScene
              label={scene.label ?? ""}
              caption={scene.caption}
              slide={scene.slide}
              index={idx}
              total={totalPoints}
            />
          );
        }

        return (
          <Sequence key={i} from={from} durationInFrames={durationFrames}>
            <AbsoluteFill>
              {sceneEl}
              {audioFile && (
                <Audio src={staticFile(audioFile)} />
              )}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
