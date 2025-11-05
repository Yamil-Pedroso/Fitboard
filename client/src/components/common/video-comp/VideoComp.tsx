interface VideoCompProps {
  src: string;
  type?: string;
  width?: number;
  height?: number;
  className?: string;
}

const VideoComp = ({
  src,
  type = "video/mp4",
  width,
  height,
}: VideoCompProps) => {
  return (
    <video controls width={width} height={height} className="">
      <source src={src} type={type} />
    </video>
  );
};

export default VideoComp;
