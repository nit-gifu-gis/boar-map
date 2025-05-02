// 選択肢がOKしか無いアラートのモーダル

import Button from "@/components/ui/Button";
import React, { useState } from "react";
import ModalCore from "./modalCore";

type Props = {
  message: string;
  resolve: (res: boolean) => void;
  cleanup: () => void;
};

const AlertModal: React.FC<Props> = (props) => {
  const [, setShow] = useState(true);
  const handleClick = () => {
    const { resolve, cleanup } = props;
    setShow(false);
    resolve(true);
    cleanup();
  };

  return (
    <ModalCore>
      <div className="whitespace-pre-wrap">{props.message}</div>
      <div className="mt-4 flex justify-around">
        <div className="w-2/5">
          <Button color="primary" onClick={handleClick}>
            <div className="text-base">OK</div>
          </Button>
        </div>
      </div>
    </ModalCore>
  );
};

export default AlertModal;
