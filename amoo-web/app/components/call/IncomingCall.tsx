"use client";

import { useEffect, useState } from "react";
import { Phone, PhoneOff, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import { socket } from "@/lib/socket";

type IncomingCallData = {
  bookingId: number;
  mode: "audio" | "video";
  callerRole: "user" | "expert";
  callerId: number;
};

type Props = {
  role: "user" | "expert";
  id: number;
};

export default function IncomingCall({ role, id }: Props) {
  const router = useRouter();
  const [call, setCall] = useState<IncomingCallData | null>(null);

  useEffect(() => {
    const handleIncomingCall = (data: IncomingCallData) => {
      console.log("INCOMING CALL:", data);
      setCall(data);
    };

    socket.on("incoming-call", handleIncomingCall);

    return () => {
      socket.off("incoming-call", handleIncomingCall);
    };
  }, []);

  useEffect(() => {
    const handleAccepted = (data: {
      bookingId: number;
      mode: "audio" | "video";
    }) => {
      console.log("CALL ACCEPTED:", {
        data,
        role,
      });

      setCall(null);

      const meetingPath = "/user-dashboard/consultations-booking/meeting";

      router.push(
        `${meetingPath}?bookingId=${data.bookingId}&mode=${data.mode}&role=${role}`,
      );
    };

    socket.on("call:accepted", handleAccepted);

    return () => {
      socket.off("call:accepted", handleAccepted);
    };
  }, [router, role]);

  const acceptCall = () => {
    if (!call) return;

    console.log("ACCEPTING CALL:", {
      bookingId: call.bookingId,
      receiverRole: role,
      receiverId: id,
    });

    socket.emit("call:accept", {
      bookingId: call.bookingId,
      receiverRole: role,
      receiverId: id,
    });
  };

  const rejectCall = () => {
    if (!call) return;

    socket.emit("call:reject", {
      bookingId: call.bookingId,
      receiverRole: role,
      receiverId: id,
    });

    setCall(null);
  };

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="w-[360px] rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#5b21a8] text-white">
          {call.mode === "video" ? (
            <Video className="h-8 w-8" />
          ) : (
            <Phone className="h-8 w-8" />
          )}
        </div>

        <h2 className="mt-5 text-center text-xl font-bold text-[#4c1d95]">
          Incoming Consultation
        </h2>

        <p className="mt-2 text-center text-sm text-gray-600">
          {call.mode === "video" ? "Video Consultation" : "Audio Consultation"}
        </p>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={rejectCall}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-red-100 text-red-600"
          >
            <PhoneOff className="h-5 w-5" />
            Reject
          </button>

          <button
            type="button"
            onClick={acceptCall}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-green-600 text-white"
          >
            <Phone className="h-5 w-5" />
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
