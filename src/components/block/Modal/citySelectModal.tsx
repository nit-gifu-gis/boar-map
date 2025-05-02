// 選択肢がOKしか無いアラートのモーダル

import Button from "@/components/ui/Button";
import SelectInput from "@/components/ui/SelectInput";
import { CityInfo } from "@/types/features";
import { useState } from "react";
import ModalCore from "./modalCore";

type Props = {
  list: CityInfo[];
  resolve: (info: CityInfo | null) => void;
  cleanup: () => void;
};

const CitySelectModal = ({ resolve, cleanup, list }: Props) => {
  const [, setShow] = useState(true);

  const handleOk = () => {
    setShow(false);
    const city_select = document.getElementById(
      "city-select",
    ) as HTMLSelectElement;
    if (city_select == null) {
      resolve(null);
      cleanup();
      return;
    }
    resolve(list[city_select.selectedIndex]);
    cleanup();
  };

  const handleCancel = () => {
    setShow(false);
    resolve(null);
    cleanup();
  };

  return (
    <ModalCore>
      <div className="whitespace-pre-wrap">
        複数の情報が見つかりました。
        <br />
        移動したい地点を選択してください。
      </div>
      <SelectInput
        options={list.map(
          (v) =>
            `${v.name} (${Math.floor(v.point.lat * 100000) / 100000},${
              Math.floor(v.point.lng * 100000) / 100000
            })`,
        )}
        id="city-select"
        error={false}
      />
      <div className="mt-4 flex justify-around">
        <div className="w-2/5">
          <Button color="accent" onClick={handleCancel}>
            <div className="text-base">キャンセル</div>
          </Button>
        </div>
        <div className="w-2/5">
          <Button color="primary" onClick={handleOk}>
            <div className="text-base">OK</div>
          </Button>
        </div>
      </div>
    </ModalCore>
  );
};

export default CitySelectModal;
