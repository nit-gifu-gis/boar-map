import { RoundedCheckProps } from "./interface";

const RoundedCheck: React.FunctionComponent<RoundedCheckProps> = ({ checked }) => {
  return (<div className={"w-6 h-6 rounded-xl border-solid border-2 flex justify-center items-center " + (checked ? "border-primary" : "border-small-text")}>
    <div className={"w-[14px] h-[14px] rounded-xl box-border " + (checked ? "bg-primary" : "")}>
    </div>
  </div>);
};

export default RoundedCheck;