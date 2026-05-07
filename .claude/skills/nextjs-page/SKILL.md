---
name: nextjs-page
description:
  Tạo Next.js page hoặc component mới theo App Router pattern với RSC,
  TanStack Query, và Zustand. Dùng khi cần thêm trang, layout, hoặc component lớn.
---

# Next.js Page/Component Pattern

## Data fetching pattern

### Server Component (default — dùng khi có thể)

```typescript
// app/videos/[id]/page.tsx
export default async function VideoPage({ params }: { params: { id: string } }) {
  const video = await getVideo(params.id); // direct fetch, no useEffect
  return <VideoPlayer video={video} />;
}
```

### Client Component với TanStack Query

```typescript
"use client";
export function VideoList() {
  const { data, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: () => apiClient.videos.list(),
  });
}
```

## Server Action pattern (mutations)

```typescript
"use server";
export async function createComment(formData: FormData) {
  const validated = commentSchema.parse(Object.fromEntries(formData));
  await db.comments.create(validated);
  revalidatePath(`/videos/${validated.videoId}`);
}
```

## Component file structure

```
components/
└── video-card/
    ├── video-card.tsx        # component chính
    ├── video-card.types.ts   # types/props
    └── index.ts              # re-export
```
