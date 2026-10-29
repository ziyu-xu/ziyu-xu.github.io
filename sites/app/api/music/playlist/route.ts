export const dynamic = "force-dynamic";

type QQSong = {
  id?: number;
  mid?: string;
  title?: string;
  name?: string;
  interval?: number;
  singer?: Array<{ name?: string }>;
  album?: { mid?: string };
};

function validPlaylistId(value: string | null) {
  return value && /^\d{6,14}$/.test(value) ? value : null;
}

export async function GET(request: Request) {
  const playlistId = validPlaylistId(new URL(request.url).searchParams.get("id"));
  if (!playlistId) return Response.json({ error: "Invalid playlist ID" }, { status: 400 });

  const payload = {
    comm: { ct: 24, cv: 0, uin: "0" },
    req_0: {
      module: "music.srfDissInfo.aiDissInfo",
      method: "uniform_get_Dissinfo",
      param: {
        disstid: Number(playlistId),
        userinfo: 1,
        tag: 1,
        orderlist: 1,
        song_begin: 0,
        song_num: 200,
        onlysonglist: 0,
        enc_host_uin: "",
      },
    },
  };

  try {
    const response = await fetch("https://u.y.qq.com/cgi-bin/musicu.fcg", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://y.qq.com",
        Referer: "https://y.qq.com/",
        "User-Agent": "Mozilla/5.0",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error(`QQ Music returned ${response.status}`);

    const result = await response.json() as {
      req_0?: { code?: number; data?: { songlist?: QQSong[] } };
    };
    if (result.req_0?.code !== 0) throw new Error("QQ Music playlist unavailable");

    const tracks = (result.req_0.data?.songlist ?? [])
      .filter((song): song is QQSong & { id: number; mid: string } => Boolean(song.id && song.mid))
      .map((song) => ({
        id: song.id,
        mid: song.mid,
        title: song.title || song.name || "未知歌曲",
        artist: song.singer?.map((artist) => artist.name).filter(Boolean).join(" / ") || "未知歌手",
        albumMid: song.album?.mid || "",
        duration: song.interval || 0,
      }));

    return Response.json({ tracks }, {
      headers: { "Cache-Control": "public, max-age=60, s-maxage=300" },
    });
  } catch {
    return Response.json({ error: "QQ Music playlist unavailable" }, { status: 502 });
  }
}
