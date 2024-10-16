import React, { useEffect, useState, useRef } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

export function TV({ setLyrics, ...props }) {
  const { nodes, materials } = useGLTF("model/TV.glb");
  const [albumCoverTexture, setAlbumCoverTexture] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);
  const textureRef = useRef(null);

  useEffect(() => {
    let interval;

    const fetchCurrentlyPlaying = async () => {
      const token_auth = window.localStorage.getItem("token_auth");
      if (!token_auth) return;

      try {
        const response = await fetch(
          "https://api.spotify.com/v1/me/player/currently-playing",
          {
            headers: {
              Authorization: `Bearer ${token_auth}`,
            },
          }
        );

        const data = await response.json();

        if (data?.item && data.item.id !== currentTrackId) {
          setCurrentTrackId(data.item.id);

          // Fetch album cover
          const albumCoverUrl = data.item.album.images[0].url;
          const textureLoader = new THREE.TextureLoader();
          textureLoader.crossOrigin = "anonymous";
          textureLoader.load(albumCoverUrl, (texture) => {
            console.log("Texture loaded:", texture);
            setAlbumCoverTexture(texture);
          });

          // Fetch lyrics
          const trackTitle = data.item.name;
          const trackArtist = data.item.artists[0].name;

          try {
            const lyricsResponse = await axios.get("/api/lyrics", {
              params: { trackTitle, trackArtist },
            });

            const lyricsData = lyricsResponse.data;

            if (lyricsData.lyrics) {
              setLyrics(lyricsData.lyrics);
            } else {
              setLyrics("Lyrics not found.");
            }
          } catch (error) {
            console.error("Error fetching lyrics:", error);
            setLyrics("Lyrics unavailable.");
          }
        }
      } catch (error) {
        console.error("Error fetching currently playing track:", error);
      }
    };
    fetchCurrentlyPlaying();
    interval = setInterval(fetchCurrentlyPlaying, 5000);

    return () => clearInterval(interval);
  }, [currentTrackId, setLyrics]);

  useEffect(() => {
    if (albumCoverTexture && textureRef.current) {
      textureRef.current.map = albumCoverTexture;
      textureRef.current.needsUpdate = true;
    }
  }, [albumCoverTexture]);

  return (
    <group
      {...props}
      dispose={null}
    >
      <group
        position={[0, 0, -1000]}
        rotation={[Math.PI / 2, 0, 13]}
      >
        <group rotation={[-Math.PI, 0, 0]}>
          <group scale={100}>
            <mesh
              geometry={nodes["1"].geometry}
              material={materials.TV_Body_material}
            />
            <mesh geometry={nodes["0"].geometry}>
              <meshBasicMaterial ref={textureRef} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("model/TV.glb");
