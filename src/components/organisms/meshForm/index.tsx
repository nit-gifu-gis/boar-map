import { useState } from "react";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import RoundButton from "../../atomos/roundButton";
import SelectInput from "../../atomos/selectInput";
import InfoInput from "../../molecules/infoInput";

const MeshForm: React.FunctionComponent = () => {
  const [isUploading, setUploading] = useState(false);
  const [buttonLabel, setButtonLabel] = useState("インポート");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const onClickImport = async () => {
    const fileForm = (document.getElementById("importMesh") as HTMLInputElement);
    if(fileForm.files == null || fileForm.files?.length === 0) {
      setError("ファイルが選択されていません。");
      return;
    }

    const fileType = (document.getElementById("importType") as HTMLSelectElement);

    const data = new FormData();
    data.append("mesh", fileForm.files[0]);
    data.append("type", fileType.options[fileType.selectedIndex].value as string);

    setError("");
    setMessage("");
    setButtonLabel("アップロード中...");
    setUploading(true);

    const res = await fetch(SERVER_URI + "/Mesh/Import", {
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

  return (
    <div className="w-full mb-[30px]">
      <div className="text-2xl font-bold">メッシュデータインポート</div>
      <div className="box-border border-solid border-2 border-border rounded-xl py-[10px] px-2 w-full">
        <div className="grid grid-cols-[150px_1fr]">
          <div className="flex col-[1/2] justify-center items-center m-1 row-[3]">
            メッシュタイプ
          </div>
          <div className="flex col-[2/3] flex-wrap justify-start items-center text-left m-1 row-[3]">
            <SelectInput
              id="importType"
              options={['ワクチンメッシュ', 'ハンターメッシュ']}
              defaultValue={"ワクチンメッシュ"}
              error={false}
            />
          </div>
          <div className="col-[1/2] flex justify-center items-center m-[5px] row-[4]">
            メッシュデータ
          </div>
          <div className="col-[2/3] flex flex-wrap justify-start items-center text-left m-[5px] row-[4]">
            <input
              type="file"
              name="importMesh"
              id="importMesh"
              accept="application/zip"
            />
          </div>
          <div className="col-[2/3] row-[5] text-sm">
            .SHX, .SHP, .DBFの3つのファイルのみを圧縮したzipファイルを選択して下さい。
          </div>
          <div className="col-[1/3] row-[6]">
            <div className="mx-auto my-5 max-w-[400px]">
              <RoundButton
                color="accent"
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

export default MeshForm;