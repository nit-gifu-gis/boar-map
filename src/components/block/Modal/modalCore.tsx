// モーダルの背景
// 入力を防ぐ

import { ReactNode } from "react";

const ModalCore = ({ children }: { children: ReactNode }) => {
  return (
    <div className="modal-bg fixed bottom-0 left-0 right-0 top-0 z-50 m-auto flex items-center justify-center">
      <div className="shadow-10 box-border h-auto w-9/10 max-w-sm bg-background p-4">
        {children}
      </div>
    </div>
  );
};

export default ModalCore;
