/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { SyntheticEvent, useEffect, useState } from "react";
import { ReportProps, FeatureBase, ReportFeature } from "../../../types/features";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import { yesNo } from "../../../utils/modal";
import { sortFeatures } from "../../../utils/sort";
import RoundButton from "../../atomos/roundButton";
import { ReportTableProps } from "./interface";

const ReportTable: React.FunctionComponent<ReportTableProps> = (p) => {
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
    setFeatures(sortFeatures(sortKey, features as ReportFeature[], isDesc));
  }, [sortKey, isDesc]);

  const sort = (key: keyof ReportProps) => {
    if(key == sortKey) {
      setDesc(b => !b);
    } else {
      setSortKey(key);
      setDesc(false);
    }
  };
  
  const onClickEdit = async (id: string | undefined, feature: FeatureBase) => {
    if(!id)
      return;
      
    const yesNoCheck = await yesNo('位置情報の編集を行いますか？');
    if(yesNoCheck) {
      router.push(
        {
          pathname: '/edit/location',
          query: {
            id: id,
            type: "作業日報",
            type_srv: `report`,
            detail: JSON.stringify(feature),
            version: 1
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
            type: "作業日報",
            type_srv: `report`,
            detail: JSON.stringify(feature),
            version: 1
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
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("地域")}
              onClick={() => sort("地域")}
            >
              地域
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("所属支部名")}
              onClick={() => sort("所属支部名")}
            >
              所属
              <br />
              支部名
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("氏名")}
              onClick={() => sort("氏名")}
            >
              氏名
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("作業開始時")}
              onClick={() => sort("作業開始時")}
            >
              作業開始
              <br />
              時刻
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 " + sortableClass("作業終了時")}
              onClick={() => sort("作業終了時")}
            >
              作業終了
              <br />
              時刻
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 "}
            >
              作業報告
              <br />
              状況報告
            </th>
            <th 
              className={"border-solid border p-1 border-border border-b-2 "}
            >
              備考
            </th>
            <th
              className={"border-solid border p-1 border-border border-b-2"}
            >
              写真
            </th>
          </tr>
          {features.map((f, i) => {
            const props = f.properties as ReportProps;
            const imageList = props.画像ID.split(',');
            return (
              <tr key={"data-" + (i + 1) + "-trap"}>
                <td className="border-solid border p-1 border-border text-right">
                  <RoundButton color="accent" onClick={() => onClickEdit(props.ID$, f)}>編集</RoundButton>
                </td>
                <td className="border-solid border p-1 border-border text-right">
                  {props.ID$}
                </td>
                <td className="border-solid border p-1 border-border">
                  {props.入力者}
                </td>
                <td className="border-solid border p-1 border-border">
                  {props.地域}
                </td>
                <td className="border-solid border p-1 border-border">
                  {props.氏名}
                </td>
                <td className="border-solid border p-1 border-border text-right">
                  {props.作業開始時.split(" ")[0]}
                  <br />
                  {props.作業開始時.split(" ")[1]}
                </td>
                <td className="border-solid border p-1 border-border text-right">
                  {props.作業終了時.split(" ")[0]}
                  <br />
                  {props.作業終了時.split(" ")[1]}
                </td>
                <td className="border-solid border p-1 border-border">
                  {props.作業報告}
                </td>
                <td className="border-solid border p-1 border-border">
                  {props.備考}
                </td>
                
                <td className="border-solid border p-1 border-border">
                  <div className="flex flex-wrap w-[300px]">
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
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ReportTable;