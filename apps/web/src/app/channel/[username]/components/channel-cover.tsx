import { GripHorizontal } from 'lucide-react';

interface ChannelCoverProps {
  coverUrl?: string | null;
  isOwnProfile?: boolean;
  onCoverSelectClick?: () => void;
}

export function ChannelCover({ coverUrl, isOwnProfile = false, onCoverSelectClick }: ChannelCoverProps) {
  return (
    <div
      className="relative h-52 w-full overflow-hidden"
      role="img"
      aria-label="Channel cover"
    >
      <div
        className="h-full w-full bg-gradient-to-br from-[#00aeec] to-[#005f8a]"
        style={
          coverUrl
            ? {
                backgroundImage: `url(${coverUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
      />

      {isOwnProfile && (
        <button
          onClick={onCoverSelectClick}
          className="absolute bottom-4 right-4 p-2 bg-background/80 hover:bg-background rounded-lg transition-colors shadow-md backdrop-blur-sm"
          title="Chọn ảnh bìa"
          aria-label="Chọn ảnh bìa"
        >
          <GripHorizontal className="h-5 w-5 text-foreground" />
        </button>
      )}
    </div>
  );
}
