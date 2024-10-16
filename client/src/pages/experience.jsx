import React, { Suspense, useEffect, useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { proxy, useSnapshot } from "valtio";
import { easing } from "maath";
import { TV } from "../components/TV";
import { LyricsDisplay } from "../components/Lyrics";

const MUSIXMATCH_API_KEY = import.meta.env.VITE_MUSIXMATCH_API_KEY;

const State = proxy({
  pointer: { x: 0, y: 0 },
});

const AnimatedGroup = ({ lyrics, setLyrics }) => {
  // Accept lyrics as a prop
  const group = useRef();
  const state = useSnapshot(State);

  useFrame((_, delta) => {
    easing.dampE(
      group.current.rotation,
      [state.pointer.y / 40, -state.pointer.x / 20, 0],
      0.25,
      delta
    );
  });

  return (
    <group
      ref={group}
      position={[0, 0, 0]}
      scale={[2, 2, 1]}
    >
      <TV setLyrics={setLyrics} />
      <LyricsDisplay lyrics={lyrics} />
    </group>
  );
};

function Experience() {
  useEffect(() => {
    console.log("MUSIXMATCH_API_KEY:", MUSIXMATCH_API_KEY);
  });
  const [lyrics, setLyrics] = useState(""); // Define lyrics state

  const handleMouseMove = (event) => {
    State.pointer.x = event.clientX / window.innerWidth - 0.5;
    State.pointer.y = event.clientY / window.innerHeight - 0.5;
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <>
      <div className="h-screen w-screen flex justify-center items-center">
        <Canvas
          shadows
          camera={[500, 500, 1000]}
          fov={10}
        >
          <color
            attach="background"
            args={["#1DB954"]}
          />
          <ambientLight intensity={1} />
          <Suspense fallback={null}>
            <ambientLight
              color={"#4f3625"}
              intensity={1}
            />
            <directionalLight
              position={[10, 0, 10]}
              intensity={10}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            <AnimatedGroup
              lyrics={lyrics}
              setLyrics={setLyrics}
            />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

export default Experience;
