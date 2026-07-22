import Image from "next/image";
import { Star } from "lucide-react";

const courses = [
  {
    title: "Learn Tarot",
    sub: "From Basics to Advanced",
    lessons: "12 Lessons",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=192&q=80",
  },
  {
    title: "Vedic Astrology",
    sub: "Complete Course",
    lessons: "20 Lessons",
    rating: "4.9",
    img: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=192&q=80",
  },
  {
    title: "Vastu Shastra",
    sub: "For Home & Office",
    lessons: "15 Lessons",
    rating: "4.7",
    img: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=192&q=80",
  },
  {
    title: "Numerology",
    sub: "Master Numbers",
    lessons: "10 Lessons",
    rating: "4.8",
    img: "https://images.unsplash.com/photo-1532968961962-8a0cb3a2d4d5?w=192&q=80",
  },
];

export default function FeaturedCourses() {
  return (
    <section className="mt-6">
      <h2 className="font-display text-[17px] font-bold text-[#4a1c7d]">Featured Courses</h2>

      <div className="mt-3.5 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {courses.map(({ title, sub, lessons, rating, img }) => (
          <article
            key={title}
            className="flex overflow-hidden rounded-[12px] border border-[#efe6d6] bg-white shadow-[0_2px_10px_rgba(42,17,72,.05)]"
          >
            <Image
              src={img}
              alt={title}
              width={192}
              height={220}
              className="h-[96px] w-[96px] shrink-0 object-cover"
            />

            <div className="flex min-w-0 flex-1 flex-col justify-center px-3.5 py-3">
              <h3 className="truncate text-[13.5px] font-semibold text-[#2b0f47]">{title}</h3>
              <p className="mt-1 truncate text-[11.5px] text-[#8b8697]">{sub}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-[#8b8697]">{lessons}</span>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#2b0f47]">
                  <Star className="h-[13px] w-[13px] fill-[#e9b85c] text-[#e9b85c]" />
                  {rating}
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
