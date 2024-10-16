import React, { useEffect, useState, useCallback } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import axios from "axios";

export function TV({ setLyrics, ...props }) {
  const { nodes, materials } = useGLTF("model/TV.glb");
  const [albumCoverTexture, setAlbumCoverTexture] = useState(null);
  const [currentTrackId, setCurrentTrackId] = useState(null);

  const fetchCurrentlyPlaying = useCallback(async () => {
    const token_auth = localStorage.getItem("token_auth");
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

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data?.item && data.item.id !== currentTrackId) {
        setCurrentTrackId(data.item.id);

        // Fetch album cover
        const albumCoverUrl = data.item.album.images[0].url;
        const image = new Image();
        image.crossOrigin = "anonymous";
        image.src = albumCoverUrl;

        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = 400;
          canvas.height = 400;
          const context = canvas.getContext("2d");

          const aspectRatio = image.width / image.height;
          const newWidth = aspectRatio > 1 ? 400 : 400 * aspectRatio;
          const newHeight = aspectRatio > 1 ? 400 / aspectRatio : 400;
          const xOffset = (400 - newWidth) / 2;
          const yOffset = (400 - newHeight) / 2;

          context.drawImage(image, xOffset, yOffset, newWidth, newHeight);
          setAlbumCoverTexture(new THREE.CanvasTexture(canvas));
        };

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
  }, [currentTrackId, setLyrics]);

  useEffect(() => {
    fetchCurrentlyPlaying();
    const interval = setInterval(fetchCurrentlyPlaying, 5000);

    return () => clearInterval(interval);
  }, [fetchCurrentlyPlaying]);

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
              {albumCoverTexture && (
                <meshBasicMaterial map={albumCoverTexture} />
              )}
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

useGLTF.preload("model/TV.glb");
