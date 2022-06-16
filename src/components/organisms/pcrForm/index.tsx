import { useState } from "react";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import { alert } from "../../../utils/modal";
import RoundButton from "../../atomos/roundButton";
import { PCRFormInterface } from "./interface";

const PCRForm: React.FunctionComponent<PCRFormInterface> = ({ maxSize }) => {
  const [isUploading, setUploading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("インポート");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onClickImport = async () => {
    const fileForm = (document.getElementById("importExcel") as HTMLInputElement);
    if(fileForm.files == null || fileForm.files?.length === 0) {
      setError("ファイルが選択されていません。");
      return;
    }

    const data = new FormData();
    data.append("excel", fileForm.files[0]);

    setError("");
    setMessage("");
    setButtonLabel("アップロード中...");
    setUploading(true);

    const res = await fetch(SERVER_URI + "/List/Import", {
      method: 'POST',
      body: data,
      headers: {
        'X-Access-Token': getAccessToken()
      }
    });

    const resp = await res.json();
    if(res.status !== 200) {
      setError(resp.error);
      setUploading(false);
      setButtonLabel("アップロード");
      return;
    }

    setMessage(resp.message);
    setUploading(false);
    setButtonLabel("アップロード");
  };

  const fileFormChanged = (e: React.FormEvent<HTMLInputElement>) => {
    const form = e.target as HTMLInputElement;
    if(!form.files || !form.files.length || !maxSize) {
      return;
    }
    const file = form.files[0];
    if(maxSize.max_size_raw <= file.size) {
      alert(`ファイルサイズが${maxSize.max_size} ${maxSize.unit}を超過しています。\n他のシートを削除して再度お試しください。`);
      form.value = '';
    }
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
              onChange={fileFormChanged}
            />
          </div>
          <div className="col-[2/3] flex flex-wrap justify-start items-center text-left m-[5px] row-[5]">
            <span className="text-sm">
              {maxSize == null ? "" : `最大ファイルサイズ: ${maxSize.max_size} ${maxSize.unit}`}
            </span>
          </div>
          <div className="col-[1/3] row-[6]">
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
          <div className="col-[1/3] mt-3 row-[7] text-center">
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