import Image from 'next/image';
import { InfoTypeItemImageProps } from './interface';

const InfoTypeItemImage: React.FunctionComponent<InfoTypeItemImageProps> = ({
  src,
  alt,
  width,
  height,
}) => {
  return (
    <div className='flex w-[52px] items-center justify-center text-center'>
      <Image width={width} height={height} alt={alt} src={src} />
    </div>
  );
};

export default InfoTypeItemImage;
