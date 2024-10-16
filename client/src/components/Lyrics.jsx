import React from "react";
import { Text3D } from "@react-three/drei";
import fontPath from "../fonts/font.json";

export function LyricsDisplay({
  lyrics,
  position = [-4, -1, -10],
  rotation = [0, -0.42, 0],
  scale = [1, 1, 0],
}) {
  return (
    <Text3D
      font={fontPath}
      scale={scale}
      rotation={rotation}
      bevelSegments={3}
      bevelEnabled
      bevelThickness={0.4}
      position={position}
    >
      {lyrics}
      <meshBasicMaterial color={"#f91414"} />
    </Text3D>
  );
}
