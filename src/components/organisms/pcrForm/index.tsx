import { useState } from "react";
import { alert } from "../../../utils/modal";
import RoundButton from "../../atomos/roundButton";

const PCRForm: React.FunctionComponent = () => {
  const [isUploading, setUploading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("インポート");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onClickImport = async () => {
    alert('Import');
  };

  return (
    <div className="w-full mb-[30px]">
      <div className="text-2xl font-bold">PCR結果インポート</div>
      <div className="box-border border-solid border-2 border-border rounded-xl py-[10px] px-2 w-full">
        <div className="grid grid-cols-[150px_1fr]">
          <div className="col-[1/2] flex justify-center items-center m-[5px] row-[4]">
            Excelファイル
          </div>
          <div className="col-[2/3] flex flex-wrap justify-start items-center text-left m-[5px] row-[4]">
            <input
              type="file"
              name="importExcel"
              id="importExcel"
              accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            />
          </div>
          <div className="col-[1/3] row-[5]">
            <div className="mx-auto my-5 max-w-[400px]">
              <RoundButton
                color="excel"
                onClick={onClickImport}
                disabled={isUploading}
              >
                {buttonLabel}
              </RoundButton>
            </div>
          </div>
          <div className="col-[1/3] mt-3 row-[6] text-center">
            <span
              className={
                "font-bold" +
                      (error != ""
                        ? " text-danger"
                        : "")
              }
            >
              {error != ""
                ? error
                : message}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCRForm;