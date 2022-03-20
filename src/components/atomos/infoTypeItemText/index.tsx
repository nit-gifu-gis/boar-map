import { InfoTypeItemTextProps } from "./interface";

const InfoTypeItemText: React.FunctionComponent<InfoTypeItemTextProps> = ({ text, selected }) => {
  return <span className={"flex justify-center items-center ml-3 text-2xl h-9 " + (selected ? "font-bold text-primary" : "")}>
    {text}
  </span>;
};

export default InfoTypeItemText;