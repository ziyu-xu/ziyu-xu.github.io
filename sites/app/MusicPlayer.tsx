"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type MusicConfig = {
  platform: string;
  type: string;
  playlistId: string;
  shareUrl: string;
  order: string;
  autoplay: boolean;
};

type Track = {
  id: number;
  mid: string;
  title: string;
  artist: string;
  albumMid: string;
  duration: number;
};

type QQPlayer = {
  data?: { state?: string };
  on: (event: string, handler: () => void) => QQPlayer;
  off: (event: string, handler?: () => void) => QQPlayer;
  play: (songMid?: string) => QQPlayer;
  pause: () => QQPlayer;
};

declare global {
  interface Window {
    QMPlayer?: new () => QQPlayer;
  }
}

const QQ_PLAYER_SCRIPT = "https://y.qq.com/component/m/qmplayer/qmplayer.full.js?max_age=604800";

function loadQQPlayer() {
  return new Promise<void>((resolve, reject) => {
    if (window.QMPlayer) {
      resolve();
      return;
    }

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${QQ_PLAYER_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("QQ player unavailable")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = QQ_PLAYER_SCRIPT;
    script.async = true;
    script.addEventListener("load", () => resolve(), { once: true });
    script.addEventListener("error", () => reject(new Error("QQ player unavailable")), { once: true });
    document.body.appendChild(script);
  });
}

function shuffleIndex(length: number, current = -1) {
  if (length < 2) return 0;
  let next = Math.floor(Math.random() * length);
  if (next === current) next = (next + 1) % length;
  return next;
}

export default function MusicPlayer({ config }: { config: MusicConfig }) {
  const playerRef = useRef<QQPlayer | null>(null);
  const indexRef = useRef(0);
  const tracksRef = useRef<Track[]>([]);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [status, setStatus] = useState("正在读取 QQ 音乐歌单…");

  const playAt = useCallback((index: number) => {
    const player = playerRef.current;
    const track = tracksRef.current[index];
    if (!player || !track) return;
    indexRef.current = index;
    setCurrentIndex(index);
    setStatus("");
    player.play(track.mid);
  }, []);

  const playRandom = useCallback(() => {
    playAt(shuffleIndex(tracksRef.current.length, indexRef.current));
  }, [playAt]);

  useEffect(() => {
    let cancelled = false;
    let player: QQPlayer | null = null;

    const onPlay = () => {
      setPlaying(true);
      setStatus("");
    };
    const onPause = () => setPlaying(false);
    const onEnded = () => playRandom();
    const onError = () => {
      setPlaying(false);
      setStatus("该歌曲暂时无法播放，请切换下一首");
    };

    Promise.all([
      fetch(`/api/music/playlist?id=${encodeURIComponent(config.playlistId)}`, { cache: "no-store" })
        .then(async (response) => {
          if (!response.ok) throw new Error("Playlist unavailable");
          return response.json() as Promise<{ tracks: Track[] }>;
        }),
      loadQQPlayer(),
    ])
      .then(([result]) => {
        if (cancelled || !window.QMPlayer || result.tracks.length === 0) return;
        tracksRef.current = result.tracks;
        setTracks(result.tracks);
        const initialIndex = config.order === "random" ? shuffleIndex(result.tracks.length) : 0;
        indexRef.current = initialIndex;
        setCurrentIndex(initialIndex);
        setStatus("");

        player = new window.QMPlayer();
        playerRef.current = player;
        player.on("play", onPlay);
        player.on("pause", onPause);
        player.on("ended", onEnded);
        player.on("error", onError);
        if (config.autoplay) player.play(result.tracks[initialIndex].mid);
      })
      .catch(() => {
        if (!cancelled) setStatus("QQ 音乐播放器暂时不可用");
      });

    return () => {
      cancelled = true;
      if (player) {
        player.pause();
        player.off("play", onPlay);
        player.off("pause", onPause);
        player.off("ended", onEnded);
        player.off("error", onError);
      }
      playerRef.current = null;
    };
  }, [config.autoplay, config.order, config.playlistId, playRandom]);

  const current = tracks[currentIndex];

  function togglePlayback() {
    const player = playerRef.current;
    if (!player || !current) return;
    if (playing) player.pause();
    else player.play(current.mid);
  }

  return (
    <aside className="music-module" aria-label="QQ 音乐随机歌单">
      <div className="music-player-main">
        <button className="music-cover-button" type="button" onClick={togglePlayback} disabled={!current} aria-label={playing ? "暂停" : "播放"}>
          {current?.albumMid ? (
            <img src={`https://y.gtimg.cn/music/photo_new/T002R150x150M000${current.albumMid}.jpg`} alt="" />
          ) : null}
          <span>{playing ? "Ⅱ" : "▶"}</span>
        </button>
        <button className="music-track-info" type="button" onClick={() => setExpanded((value) => !value)}>
          <strong>{current?.title ?? "QQ 音乐"}</strong>
          <small>{status || current?.artist}</small>
        </button>
        <button className="music-next" type="button" onClick={playRandom} disabled={!current} aria-label="随机下一首">↝</button>
      </div>
      {expanded && tracks.length > 0 ? (
        <ol className="music-playlist">
          {tracks.map((track, index) => (
            <li key={track.mid}>
              <button className={index === currentIndex ? "is-current" : ""} type="button" onClick={() => playAt(index)}>
                <span>{track.title}</span>
                <small>{track.artist}</small>
              </button>
            </li>
          ))}
          <li className="music-source-link"><a href={config.shareUrl} target="_blank" rel="noreferrer">在 QQ 音乐中打开歌单</a></li>
        </ol>
      ) : null}
    </aside>
  );
}
