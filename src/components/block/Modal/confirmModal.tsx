// 選択肢がOKしか無いアラートのモーダル

import ModalCore from "@/components/block/Modal/modalCore";
import Button from "@/components/ui/Button";
import { useState } from "react";

type Props = {
  message: string;
  resolve: (res: boolean) => void;
  cleanup: () => void;
};

const ConfirmModal = ({ resolve, cleanup, message }: Props) => {
  const [, setShow] = useState(true);
  const onOkClicked = () => {
    setShow(false);
    resolve(true);
    cleanup();
  };

  const onCancelClicked = () => {
    setShow(false);
    resolve(false);
    cleanup();
  };

  return (
    <ModalCore>
      <div className="whitespace-pre-wrap">{message}</div>
      <div className="mt-4 flex justify-around">
        <div className="w-2/5">
          <Button color="accent" onClick={onCancelClicked.bind(this)}>
            <div className="text-base">キャンセル</div>
          </Button>
        </div>
        <div className="w-2/5">
          <Button color="primary" onClick={onOkClicked.bind(this)}>
            <div className="text-base">OK</div>
          </Button>
        </div>
      </div>
    </ModalCore>
  );
};

export default ConfirmModal;
