"use client";

import { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";
import { useSearchParams } from "next/navigation";
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalAudioTrack,
  ILocalVideoTrack,
} from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video, VideoOff, PhoneOff } from "lucide-react";
import { api } from "@/lib/api";

type Mode = "audio" | "video";

export default function MeetingPage() {
  const searchParams = useSearchParams();

  const bookingId = Number(searchParams.get("bookingId"));
  const mode = searchParams.get("mode") as Mode;
  const callerRole = searchParams.get("role") as "user" | "expert";

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const audioRef = useRef<ILocalAudioTrack | null>(null);
  const videoRef = useRef<ILocalVideoTrack | null>(null);
  const startedRef = useRef(false);

  const [connecting, setConnecting] = useState(true);
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const [videoOff, setVideoOff] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!joined || mode !== "video" || !videoRef.current) return;

    const frame = requestAnimationFrame(() => {
      const localVideo = document.getElementById("local-video");

      if (localVideo && videoRef.current) {
        videoRef.current.play(localVideo);
      }
    });

    return () => cancelAnimationFrame(frame);
  }, [joined, mode]);

  useEffect(() => {
    if (
      !bookingId ||
      (mode !== "audio" && mode !== "video") ||
      (callerRole !== "user" && callerRole !== "expert")
    ) {
      console.error("INVALID MEETING PARAMS:", {
        bookingId,
        mode,
        callerRole,
        url: window.location.href,
      });

      setError("Invalid consultation details.");
      setConnecting(false);
      return;
    }

    if (startedRef.current) return;

    startedRef.current = true;

    startMeeting();

    return () => {
      cleanup();
    };
  }, [bookingId, mode, callerRole]);

  const startMeeting = async () => {
    try {
      console.log("1. startMeeting");

      setConnecting(true);
      setError("");

      console.log("2. bookingId:", bookingId);

      const response = await api.getAgoraToken(bookingId);

      console.log("3. token response:", response);

      const data = response as {
        token: string;
        appId: string;
        channelName: string;
        uid: number;
      };

      const { token, appId, channelName, uid } = data;

      console.log("4. Agora data:", {
        appId,
        channelName,
        uid,
        hasToken: !!token,
      });

      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      clientRef.current = client;

      client.on("user-published", async (user, mediaType) => {
        console.log("REMOTE USER PUBLISHED:", {
          uid: user.uid,
          mediaType,
        });
        await client.subscribe(user, mediaType);
        if (mediaType === "video") {
          const remoteVideo = document.getElementById("remote-video");
          if (remoteVideo) {
            user.videoTrack?.play(remoteVideo);
          }
        }
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
      });

      client.on("user-left", (user) => {
        console.log("Remote user left:", user.uid);

        const remoteVideo = document.getElementById("remote-video");

        if (remoteVideo) {
          remoteVideo.innerHTML = "";
        }
      });

      await client.join(appId, channelName, token, uid);
      const audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      audioRef.current = audioTrack;
      if (mode === "video") {
        const videoTrack = await AgoraRTC.createCameraVideoTrack();
        videoRef.current = videoTrack;
        await client.publish([audioTrack, videoTrack]);
        setJoined(true);
      } else {
        await client.publish([audioTrack]);
      }

      console.log("7. meeting started");

      setJoined(true);
    } catch (err) {
      console.error("Agora meeting error:", err);

      setError(err instanceof Error ? err.message : "Unable to join meeting.");
    } finally {
      console.log("8. finally");
      setConnecting(false);
    }
  };

  const toggleMic = async () => {
    if (!audioRef.current) return;

    const nextMuted = !muted;

    await audioRef.current.setEnabled(!nextMuted);

    setMuted(nextMuted);
  };

  const toggleVideo = async () => {
    if (!videoRef.current) return;

    const nextVideoOff = !videoOff;

    await videoRef.current.setEnabled(!nextVideoOff);

    setVideoOff(nextVideoOff);
  };

  const cleanup = async () => {
    audioRef.current?.close();
    videoRef.current?.close();

    audioRef.current = null;
    videoRef.current = null;

    if (clientRef.current) {
      try {
        await clientRef.current.leave();
      } catch (error) {
        console.error("AGORA LEAVE ERROR:", error);
      }

      clientRef.current = null;
    }
  };

  const endMeeting = async () => {
    socket.emit("call:end", {
      bookingId,
      callerRole,
    });

    await cleanup();
    setJoined(false);

    window.location.href =
      callerRole === "expert" ? "/astrologer-dashboard" : "/user-dashboard";
  };

  if (connecting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#170426] text-white">
        <p className="text-lg">Connecting to consultation...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#170426] px-5">
        <div className="rounded-2xl bg-white p-8 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-[#170426]">
      {/* Remote video */}
      {mode === "video" ? (
        <div id="remote-video" className="absolute inset-0 bg-black" />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-[#5b21a8] text-3xl">
              A
            </div>

            <h1 className="text-2xl font-semibold">Audio Consultation</h1>

            <p className="mt-2 text-white/60">Waiting for expert...</p>
          </div>
        </div>
      )}

      {/* Local video */}
      {mode === "video" && (
        <div
          id="local-video"
          className="absolute right-5 top-5 h-[180px] w-[260px] overflow-hidden rounded-xl border border-white/20 bg-gray-900"
        />
      )}

      {/* Controls */}
      {joined && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/50 p-3 backdrop-blur">
          <button
            type="button"
            onClick={toggleMic}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white"
          >
            {muted ? (
              <MicOff className="text-red-600" />
            ) : (
              <Mic className="text-[#4c1d95]" />
            )}
          </button>

          {mode === "video" && (
            <button
              type="button"
              onClick={toggleVideo}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white"
            >
              {videoOff ? (
                <VideoOff className="text-red-600" />
              ) : (
                <Video className="text-[#4c1d95]" />
              )}
            </button>
          )}

          <button
            type="button"
            onClick={endMeeting}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white"
          >
            <PhoneOff />
          </button>
        </div>
      )}
    </main>
  );
}
