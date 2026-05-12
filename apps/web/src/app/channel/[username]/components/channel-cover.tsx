interface ChannelCoverProps {
  coverUrl?: string | null;
}

export function ChannelCover({ coverUrl }: ChannelCoverProps) {
  return (
    <div
      className="h-64 w-full bg-gradient-to-br from-blue-400 to-purple-500"
      style={
        coverUrl
          ? {
              backgroundImage: `url(${coverUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : undefined
      }
      role="img"
      aria-label="Channel cover"
    />
  );
}
