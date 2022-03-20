import Image from 'next/image';
import { InfoTypeItemImageProps } from "./interface";

const InfoTypeItemImage: React.FunctionComponent<InfoTypeItemImageProps> = ({ src, alt, width, height }) => {
  return (
    <div className="w-[52px] text-center flex justify-center items-center">
      <Image width={width} height={height} alt={alt} src={src} />
    </div>
  );
};

export default InfoTypeItemImage;