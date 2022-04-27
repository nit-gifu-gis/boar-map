/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { BoarCommonPropsV2, BoarFeaturePropsV2, BoarFeatureV2, BoarInfoPropsV2, FeatureBase } from "../../../types/features";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import { yesNo } from "../../../utils/modal";
import { sortFeatures } from "../../../utils/sort";
import RoundButton from "../../atomos/roundButton";
import { BoarTableProps } from "./interface";

const BoarTable: React.FunctionComponent<BoarTableProps> = (p) => {
  const router = useRouter();
  const [sortKey, setSortKey] = useState("ID$");
  const [isDesc, setDesc] = useState(false);
  const [features, setFeatures] = useState<FeatureBase[]>([]);

  const sortableClass = (key: string) => {
    if(key == sortKey) {
      if(isDesc) {
        return "sortable desc";
      } else {
        return "sortable asc";
      }
    }
    return "sortable";    
  };

  useEffect(() => {
    const features = p.features.slice();
    setFeatures(sortFeatures(sortKey, features as BoarFeatureV2[], isDesc));
  }, [sortKey, isDesc]);

  const sort = (key: keyof BoarInfoPropsV2 | keyof BoarCommonPropsV2 | "幼獣の頭数" | "成獣の頭数") => {
    if(key == sortKey) {
      setDesc(b => !b);
    } else {
      setSortKey(key);
      setDesc(false);
    }
  };
  
  const onClickEdit = async (id: string | undefined, version: number | undefined, feature: FeatureBase) => {
    if(!id && !version)
      return;

    const yesNoCheck = await yesNo('位置情報の編集を行いますか？');
    if(yesNoCheck) {
      router.push(
        {
          pathname: '/edit/location',
          query: {
            id: id,
            type: "いのしし捕獲地点",
            type_srv: `boar-${version}`,
            version: version,
            detail: JSON.stringify(feature),
          },
        },
        '/edit/location',
      );
    } else {
      router.push(
        {
          pathname: '/edit/image',
          query: {
            id: id,
            type: "いのしし捕獲地点",
            type_srv: `boar-${version}`,
            version: version,
            detail: JSON.stringify(feature),
          },
        },
        '/edit/image',
      );
    }
  };

  return (
    <div className="">
      <table className="block border-collapse whitespace-pre">
        <tbody className="table">
          <tr>
            <th 
              className={"border-solid border p-1 border-border border-b-2"}
            >
              
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("ID$")}
              onClick={() => sort("ID$")}
            >
              ID$
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("入力者")}
              onClick={() => sort("入力者")}
            >
              入力者
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("メッシュ番")}
              onClick={() => sort("メッシュ番")}
            >
              メッシュ番号
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("区分")}
              onClick={() => sort("区分")}
            >
              区分
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("捕獲年月日")}
              onClick={() => sort("捕獲年月日")}
            >
              捕獲
              <br />
              年月日
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("罠発見場所")}
              onClick={() => sort("罠発見場所")}
            >
              わなの種類
              <br />
              発見場所
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("捕獲頭数")}
              onClick={() => sort("捕獲頭数")}
            >
              頭数
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("幼獣の頭数")}
              onClick={() => sort("幼獣の頭数")}
            >
              幼獣の
              <br />
              頭数
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("成獣の頭数")}
              onClick={() => sort("成獣の頭数")}
            >
              成獣の
              <br />
              頭数
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              枝番
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2"}
            >
              幼獣
              <br />
              成獣
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              性別
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2"}
            >
              妊娠の
              <br />
              状況
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              体長
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              体重
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              処分
              <br />
              方法
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              遠沈管番号
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              備考
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              ジビエ業者
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              個体管理番号
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              PCR検査日
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              PCR検査結果
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              確認番号
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              写真
            </th>
          </tr>
          {features.map((f, i) => {
            const props = f.properties as BoarFeaturePropsV2;
            const imageList = [props.歯列写真ID, ...props.写真ID.split(',')].filter(e=>e);
            return props.捕獲いのしし情報.map((_, index, arr) => {
              const d = arr[index].properties;
              return (
                <tr key={"data-" + (i + 1) + "-boar-" + (index + 1)}>
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      <RoundButton color="accent" onClick={() => onClickEdit(props.ID$, (f as BoarFeatureV2).version, f)}>編集</RoundButton>
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      {props.ID$}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border" rowSpan={arr.length}>
                      {props.入力者}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      {props.メッシュ番}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border" rowSpan={arr.length}>
                      {props.区分}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      {props.捕獲年月日}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border" rowSpan={arr.length}>
                      {props.罠発見場所}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      {props.捕獲頭数}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      {props.捕獲いのしし情報.filter(v => v.properties.成獣幼獣別 == "幼獣").length}
                    </td>
                  ): <></>}
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border text-right" rowSpan={arr.length}>
                      {props.捕獲いのしし情報.filter(v => v.properties.成獣幼獣別 == "成獣").length}
                    </td>
                  ): <></>}
                  <td className="border-solid border p-1 border-border text-right">
                    {d.枝番 ? d.枝番 : 1}
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.成獣幼獣別}
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.性別}
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.妊娠の状況}
                  </td>
                  <td className="border-solid border p-1 border-border text-right">
                    {d.体長} cm
                  </td>
                  <td className="border-solid border p-1 border-border text-right">
                    {d.体重} kg
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.処分方法}
                  </td>
                  <td className="border-solid border p-1 border-border text-right">
                    {d.遠沈管番号}
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.備考}
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.ジビエ業者}
                  </td>
                  <td className="border-solid border p-1 border-border text-right">
                    {d.個体管理番 ? d.個体管理番.replaceAll("-", "") : "(未入力)"}
                  </td>
                  <td className="border-solid border p-1 border-border text-right">
                    {d.PCR検査日 ? d.PCR検査日 : "(未入力)"}
                  </td>
                  <td className="border-solid border p-1 border-border">
                    {d.PCR結果 ? d.PCR結果 : "(未入力)"}
                  </td>
                  <td className="border-solid border p-1 border-border text-right">
                    {d.確認番号 ? d.確認番号 : "なし"}
                  </td>
                  {index == 0 ? (
                    <td className="border-solid border p-1 border-border" rowSpan={arr.length}>
                      <div className="flex flex-wrap w-[650px]">
                        {imageList.length == 0 ? <div>画像なし</div> : imageList.filter(e=>e).map((v, img_i) => {
                          const url = `${SERVER_URI}/Image/GetImage?id=${v}&token=${getAccessToken()}`;
                        
                          // 200px x 200pxでエリアを確保しておき、ロード後に長辺200pxになるようにリサイズする
                          const onLoaded = (e: SyntheticEvent<HTMLImageElement>) => {
                            const elem = e.target as HTMLImageElement;

                            const calcShort = (long: number, short: number) => {
                              return short * (200.0 / long);
                            };

                            const w = elem.naturalWidth > elem.naturalHeight ? 200 : calcShort(elem.naturalHeight, elem.naturalWidth);
                            const h = elem.naturalWidth > elem.naturalHeight ? calcShort(elem.naturalWidth, elem.naturalHeight) : 200;
                            elem.setAttribute('style', `width: ${w}px; height: ${h}px;`);
                          };

                          return (
                            <a href={url} rel="noopener noreferrer" target="_blank" key={"Image_" + (img_i + 1) + "_" + (props.ID$)}>
                              <img src={url} alt={"Image " + (img_i + 1) + " of ID " + (props.ID$)} className="max-w-none m-[5px]" style={{ width: "200px", height: "200px" }} onLoad={onLoaded}/>
                            </a>
                          );
                        })}
                      </div>
                    </td>
                  ): <></>}
                </tr>
              );
            });
          })}
        </tbody>
      </table>
    </div>
  );
};

export default BoarTable;