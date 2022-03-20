import InfoTypeItemImage from "../../atomos/infoTypeItemImage";
import InfoTypeItemText from "../../atomos/infoTypeItemText";
import { InfoTypeItemProps } from "./interface";

const InfoTypeItem: React.FunctionComponent<InfoTypeItemProps> = ({ src, alt, text, width, height, selected }) => {
  return (
    <div className="info-type-item">
      <div className="flex items-center">
        <InfoTypeItemImage src={src} alt={alt} width={width} height={height} />
        <InfoTypeItemText text={text} selected={selected} />
      </div>
    </div>
  );
};

export default InfoTypeItem;