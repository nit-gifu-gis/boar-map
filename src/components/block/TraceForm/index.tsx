"use client";

import { useState } from "react";

const TraceForm = () => {
  const [value, setValue] = useState<number | null>();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value));
  };

  const handleSubmit = () => {
    console.log("submit");
  };

  return (
    <div className="mx-auto px-4 pt-3">
      <div className="text-2xl font-bold">検索条件</div>
      <div className="mb-8 box-border w-full rounded-xl border-2 border-solid border-border px-4 py-3">
        <div className="grid grid-cols-[100px,1fr]">
          <div className="col-[1/2] row-[1] m-1 flex items-center justify-center">
            確認番号
          </div>
          <div className="col-[2/3] row-[1] m-1 flex flex-wrap items-center justify-start text-left">
            <div className="w-full">
              <input
                type="number"
                className="box-border w-full rounded-lg border-2 border-solid border-border bg-input-bg p-2 text-lg"
                placeholder="0000"
                onChange={handleChange}
              />
            </div>
            <div className="mb-1 ml-1 w-full text-sm text-danger"></div>
          </div>
        </div>
        <div className="col-[1/3] row-[5]">
          <div className="mx-auto mb-1 mt-5 max-w-[400px]">
            <button
              onClick={handleSubmit}
              className="shadow-5 active:shadow-5-active box-border w-full rounded-rd bg-disabled px-5 py-2 text-center text-xl font-bold text-background"
              disabled={!value}
            >
              検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TraceForm;
