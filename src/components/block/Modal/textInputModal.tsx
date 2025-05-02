// 選択肢がOKしか無いアラートのモーダル

import ModalCore from "@/components/block/Modal/modalCore";
import Button from "@/components/ui/Button";
import { useState } from "react";
import InfoInput from "../infoInput";

type Props = {
  message: string;
  input_title: string;
  resolve: (input: string | null) => void;
  cleanup: () => void;
};

const TextInputModal = ({ resolve, cleanup, input_title, message }: Props) => {
  const [, setShow] = useState(true);
  const onOKClicked = () => {
    setShow(false);
    const city_select = document.getElementById(
      "modalinput_text",
    ) as HTMLSelectElement;
    if (city_select == null) {
      resolve(null);
      cleanup();
      return;
    }
    resolve(city_select.value as string);
    cleanup();
  };

  const onCancelClicked = () => {
    setShow(false);
    resolve(null);
    cleanup();
  };

  return (
    <ModalCore>
      <div className="whitespace-pre-wrap">{message}</div>
      <div className="whitespace-pre-wrap pt-5">{input_title}</div>
      <InfoInput title={""} type="textarea" rows={3} id="modalinput_text" />
      <div className="mt-4 flex justify-around">
        <div className="w-2/5">
          <Button color="accent" onClick={onCancelClicked.bind(this)}>
            <div className="text-base">キャンセル</div>
          </Button>
        </div>
        <div className="w-2/5">
          <Button color="primary" onClick={onOKClicked.bind(this)}>
            <div className="text-base">OK</div>
          </Button>
        </div>
      </div>
    </ModalCore>
  );
};

export default TextInputModal;
