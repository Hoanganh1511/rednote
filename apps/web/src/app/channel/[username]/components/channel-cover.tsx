interface ChannelCoverProps {
  coverUrl?: string | null;
}

export function ChannelCover({ coverUrl }: ChannelCoverProps) {
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
    </div>
  );
}
