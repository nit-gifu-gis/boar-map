import "./infoTypeSelector.scss";
import Router from "next/router";
import InfoTypeItem from "../../molecules/InfoTypeItem";

const InfoTypeSelector = () => {
  return (
    <div className="infoTypeSelector">
      <div className="radio">
        <input type="radio" name="infoType" value="boar" />
        <InfoTypeItem
          src="../static/images/icons/boar.svg"
          alt="いのししアイコン"
          text="捕獲いのしし"
        />
        <input type="radio" name="infoType" value="trap" />
        <InfoTypeItem
          src="../static/images/icons/trap.svg"
          alt="わなアイコン"
          text="わな"
        />
        <input type="radio" name="infoType" value="vaccine" />
        <InfoTypeItem
          src="../static/images/icons/vaccine.svg"
          alt="ワクチンアイコン"
          text="ワクチン"
        />
      </div>
    </div>
  );
};

export default InfoTypeSelector;
