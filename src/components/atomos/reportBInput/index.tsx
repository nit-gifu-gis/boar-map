import React, { useMemo } from "react";
import TextInput from "../TextInput";
import { ReportBInputProps } from "./interface";

const ReportBInput: React.FC<ReportBInputProps> = (props) => {
  const parsedToolValue = useMemo(() => {
    // データ構造は下記の通り
    // (電気とめさし器(チェック時))/(銃(チェック時))/(その他(チェック時))
    // その他の場合の内容
    const data = {
      tool: {
        elec: false,
        gun: false,
        other: false
      },
      other_tool: ''
    };

    if (!props.toolDefaultValue) {
      return data;
    }
    
    const lines = props.toolDefaultValue.split('\n');
    const tool = (lines[0] || '').split('/');
    data.tool.elec = tool[0] === '電気とめさし器';
    data.tool.gun = tool[1] === '銃';
    data.tool.other = tool[2] === 'その他';

    data.other_tool = lines[1];

    return data;
  }, [props.toolDefaultValue]);

  const [isOther, setIsOther] = React.useState(parsedToolValue.tool.other);

  return (
    <div className='m-[15px]'>
      <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
        作業日報B
        {props.required ? <span className='ml-[5px] font-bold text-danger'>*</span> : <></>}
      </div>
      {props.error != null ? (
        <div className='-mt-[5px] mb-[5px] w-full text-sm text-danger'>{props.error}</div>
      ) : (
        <></>
      )}
      <div>※ その他の項目は自動的に計算されます。</div>
      <div>
        <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
          捕獲作業を手伝った者の氏名
        </div>
        <TextInput 
          type="text"
          id={props.id + "_helper"}
          defaultValue={props.helperDefaultValue || ''}
        />
      </div>
      <div>
        <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
          とめさしの道具
        </div>
        <div className="flex mb-2 flex-wrap">
          <div className="mr-4 mb-2">
            <input type="checkbox" id={`${props.id}_elec`} className="scale-[2] w-7 mr-1" defaultChecked={parsedToolValue.tool.elec} />
            <label htmlFor={`${props.id}_elec`} className="text-lg" >電気とめさし器</label>
          </div>
          <div className="mr-4 mb-2">
            <input type="checkbox" id={`${props.id}_gun`} className="scale-[2] w-7 mr-1" defaultChecked={parsedToolValue.tool.gun} />
            <label htmlFor={`${props.id}_gun`} className="text-lg" >銃</label>
          </div>
          <div>
            <input type="checkbox" id={`${props.id}_other`} className="scale-[2] w-7 mr-1" defaultChecked={parsedToolValue.tool.other} onChange={(e) => setIsOther(e.target.checked)}/>
            <label htmlFor={`${props.id}_other`} className="text-lg" >その他</label>
          </div>
        </div>
        {isOther ? (
          <TextInput 
            type="text"
            id={props.id + "_other_tool"}
            defaultValue={parsedToolValue.other_tool}
          />
        ) : <></>}
      </div>
    </div>
  );
};

export default ReportBInput;