import { celestialPortraitSvg } from "../../lib/celestialAvatar";

export function SkyAvatar({
  name,
  sign = "Aries",
  src,
  size = 44,
}: {
  name: string;
  sign?: string;
  src?: string;
  size?: number;
}) {
  const portrait = src || celestialPortraitSvg(name || "Friend", sign || "Aries");
  return (
    <span className="sky-avatar" style={{ width: size, height: size }} aria-hidden="true">
      <img src={portrait} alt="" />
    </span>
  );
}
