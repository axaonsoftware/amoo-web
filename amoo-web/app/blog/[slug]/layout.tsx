import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_URL}/api/blogs/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return { title: "Blog Post" };
    const json = await res.json();
    const post = json?.data;
    if (!post?.title) return { title: "Blog Post" };
    return {
      title: post.title,
      description: post.excerpt || `Read "${post.title}" on Amoo Guru's blog.`,
      openGraph: {
        title: post.title,
        description: post.excerpt || undefined,
        type: "article",
        images: post.image ? [{ url: post.image, width: 1200, height: 630 }] : undefined,
      },
    };
  } catch {
    return { title: "Blog Post" };
  }
}

export default function BlogSlugLayout({ children }: { children: React.ReactNode }) {
  return children;
}
