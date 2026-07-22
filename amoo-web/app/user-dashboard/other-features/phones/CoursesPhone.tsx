import Image from "next/image";
import { ChevronLeft } from "lucide-react";

import Phone, { StatusBar } from "../Phone";

const COURSES = [
  {
    title: "Vedic Astrology",
    subtitle: "Beginner to Advanced",
    progress: 65,
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
  {
    title: "Numerology",
    subtitle: "Mastery Course",
    progress: 45,
    thumb: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=80",
  },
];

export default function CoursesPhone() {
  return (
    <Phone>
      <StatusBar tone="dark" />

      <div className="flex min-h-0 flex-1 flex-col px-[11px] pb-[13px]">
        {/* Header */}
        <div className="relative mt-[6px] flex h-[18px] shrink-0 items-center">
          <ChevronLeft
            className="h-[12px] w-[12px] text-[#241268]"
            strokeWidth={2.5}
          />
          <span className="absolute inset-x-0 text-center text-[11px] font-bold leading-none text-[#241268]">
            My Courses
          </span>
        </div>

        {/* Tabs */}
        <div className="mt-[14px] flex shrink-0 border-b border-[#EFEDF7]">
          <div className="flex flex-1 flex-col items-center pb-[7px]">
            <span className="text-[9.5px] font-bold leading-none text-[#3A1C96]">
              Enrolled
            </span>
            <span className="mt-[6px] h-[1.5px] w-[48px] rounded-full bg-[#6C3CF0]" />
          </div>
          <div className="flex flex-1 items-center justify-center pb-[7px]">
            <span className="text-[9.5px] font-medium leading-none text-[#A5A1B8]">
              Completed
            </span>
          </div>
        </div>

        {/* Course cards */}
        <div className="mt-[12px] flex shrink-0 flex-col gap-[12px]">
          {COURSES.map((course) => (
            <div
              key={course.title}
              className="rounded-[12px] bg-[#EDE8FB] p-[10px]"
            >
              <div className="flex items-center gap-[10px]">
                <Image
                  src={course.thumb}
                  alt=""
                  width={34}
                  height={34}
                  className="h-[34px] w-[34px] shrink-0 rounded-[9px] object-cover"
                />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate text-[8px] font-bold leading-[1.2] text-[#241268]">
                    {course.title}
                  </span>
                  <span className="mt-[2px] truncate text-[7.5px] font-semibold leading-[1.2] text-[#4A3F80]">
                    {course.subtitle}
                  </span>
                </div>
              </div>

              <div className="mt-[9px] flex items-center gap-[8px]">
                <div className="min-w-0 flex-1">
                  <span className="text-[7.5px] font-semibold leading-none text-[#4A3F80]">
                    Progress {course.progress}%
                  </span>
                  <div className="mt-[4px] h-[3px] w-full rounded-full bg-white/70">
                    <span
                      className="block h-full rounded-full bg-[#3A1C96]"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <span className="flex h-[16px] shrink-0 items-center rounded-full bg-white px-[8px] text-[7px] font-bold leading-none text-[#4A3F80]">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* View All */}
        <div className="mt-auto flex h-[28px] shrink-0 items-center justify-center rounded-[10px] bg-[#EEEAFB]">
          <span className="text-[10px] font-bold leading-none text-[#4A22DE]">
            View All Courses
          </span>
        </div>
      </div>
    </Phone>
  );
}
