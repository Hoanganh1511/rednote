import Image from 'next/image';
import { cn } from '@/lib/utils';

type PostImageGridProps = {
  urls: string[];
  /** true cho card đầu tiên trong feed để browser load trước */
  priority?: boolean;
  className?: string;
};

export function PostImageGrid({ urls, priority = false, className }: PostImageGridProps) {
  const count = urls.length;
  if (count === 0) return null;

  // 1 ảnh: full-width, tỉ lệ 4:3, object-cover
  if (count === 1) {
    const [url] = urls;
    if (!url) return null;
    return (
      <div className={cn('relative aspect-[4/3] overflow-hidden', className)}>
        <Image
          src={url}
          alt=""
          fill
          className="object-cover object-center"
          sizes="(max-width: 640px) 100vw, 33vw"
          priority={priority}
        />
      </div>
    );
  }

  // 2 ảnh: 2 cột bằng nhau, ô vuông 1:1
  if (count === 2) {
    return (
      <div className={cn('grid grid-cols-2 gap-0.5', className)}>
        {urls.map((url, i) => (
          <div key={i} className="relative aspect-square overflow-hidden">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 50vw, 17vw"
              priority={priority && i === 0}
            />
          </div>
        ))}
      </div>
    );
  }

  // 3 ảnh: 1 lớn trái (2/3) + 2 nhỏ xếp chồng phải (1/3)
  if (count === 3) {
    const [mainUrl] = urls;
    const sideUrls = urls.slice(1, 3);
    if (!mainUrl) return null;
    return (
      <div
        className={cn('grid aspect-[4/3] gap-0.5', className)}
        style={{ gridTemplateColumns: '2fr 1fr', gridTemplateRows: '1fr 1fr' }}
      >
        <div className="relative row-span-2 overflow-hidden">
          <Image
            src={mainUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 67vw, 22vw"
            priority={priority}
          />
        </div>
        {sideUrls.map((url, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image
              src={url}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 640px) 33vw, 11vw"
            />
          </div>
        ))}
      </div>
    );
  }

  // 4+ ảnh: lưới 2×2, ô cuối overlay "+N" nếu còn thừa
  const displayed = urls.slice(0, 4);
  const remaining = count - 4;

  return (
    <div className={cn('grid grid-cols-2 gap-0.5', className)}>
      {displayed.map((url, i) => (
        <div key={i} className="relative aspect-square overflow-hidden">
          <Image
            src={url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, 17vw"
            priority={priority && i === 0}
          />
          {i === 3 && remaining > 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="text-2xl font-bold text-white drop-shadow-lg">+{remaining}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
