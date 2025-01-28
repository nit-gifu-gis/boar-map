import React, { useMemo, useState } from "react";
import { WorkDetailInputProps } from "./interface";
import TextInput from "../TextInput";
import InfoInput from "../../molecules/infoInput";

const WorkDetailInput: React.FC<WorkDetailInputProps> = (props) => {
  const parsedDefaultValue = useMemo(() => {
    const data = {
      trap: {
        placed: 0,
        removed: 0
      },
      capture: false,
      crawl: false,
      capture_type: {
        own: false,
        help: false,
        mistake: false
      }
    };

    if (!props.workDefaultValue) {
      return data;
    }


    // データ構造は下記の通り (スラッシュは未チェック時も挿入される)
    // (わな設置)/(撤去)/(見回り(チェック時))/(捕獲(チェック時))
    // 自身のわな/捕獲手伝い/錯誤捕獲

    const lines = props.workDefaultValue.split('\n');
    const trap = (lines[0] || '').split('/');
    data.trap.placed = isNaN(parseInt(trap[0])) ? 0 : parseInt(trap[0]);
    data.trap.removed = isNaN(parseInt(trap[1])) ? 0 : parseInt(trap[1]);
    if (trap[2] === '見回り') {
      data.crawl = true;
    }
    if (trap[3] === '捕獲') {
      data.capture = true;
    }

    const capture = (lines[1] || '').split('/');
    data.capture_type.own = capture[0] === '自身のわな';
    data.capture_type.help = capture[1] === '捕獲手伝い';
    data.capture_type.mistake = capture[2] === '錯誤捕獲';

    return data;
  }, [props.workDefaultValue]);

  const parsedMistakeValue = useMemo(() => {
    const data = {
      trap_type: '',
      head_count: 0,
      response: '',
      animal_type: {
        deer: false,
        serow: false,
        boar: false,
        other: false
      },
      animal_other: ''
    };

    if (!props.mistakeDefaultValue) {
      return data;
    }

    // データ構造は下記の通り
    // わなの種類
    // 頭数
    // 対応
    // (ニホンジカ(チェック時))/(カモシカ(チェック時))/(ツキノワグマ(チェック時))/(その他(チェック時))
    // その他の場合の獣種

    const lines = props.mistakeDefaultValue.split('\n');
    data.trap_type = (lines[0] || '');
    data.head_count = isNaN(parseInt(lines[1])) ? 0 : parseInt(lines[1]);
    data.response = (lines[2] || '');
    
    const animal = (lines[3] || '').split('/');
    data.animal_type.deer = animal[0] === 'ニホンジカ';
    data.animal_type.serow = animal[1] === 'カモシカ';
    data.animal_type.boar = animal[2] === 'ツキノワグマ';
    data.animal_type.other = animal[3] === 'その他';

    data.animal_other = lines[4];

    return data;
  }, [props.mistakeDefaultValue]);

  const [isCaptureSet, setIsCaptureSet] = useState(parsedDefaultValue.capture);
  const [isMistake, setIsMistake] = useState(parsedDefaultValue.capture_type.mistake);
  const [isOther, setIsOther] = useState(parsedMistakeValue.animal_type.other);

  return (
    <div className='m-[15px]'>
      <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
        作業内容
        {props.required ? <span className='ml-[5px] font-bold text-danger'>*</span> : <></>}
      </div>
      {props.error != null ? (
        <div className='-mt-[5px] mb-[5px] w-full text-sm text-danger'>{props.error}</div>
      ) : (
        <></>
      )}

      <div className="mb-2">
        <div>わな設置</div>
        <div className="flex">
          <div className="flex-1">
            <TextInput 
              type="number"
              id={props.id + "_placed"}
              defaultValue={`${parsedDefaultValue.trap.placed}`}
            />
          </div>
          <div className="flex items-center mx-1 font-bold text-lg">基</div>
        </div>
      </div>

      <div className="mb-2">
        <div>わな撤去</div>
        <div className="flex">
          <div className="flex-1">
            <TextInput 
              type="number"
              id={props.id + "_removed"}
              defaultValue={`${parsedDefaultValue.trap.removed}`}
            />
          </div>
          <div className="flex items-center mx-1 font-bold text-lg">基</div>
        </div>
      </div>

      <div className="flex mb-2 flex-wrap">
        <div>
          <input type="checkbox" id={`${props.id}_crawl`} className="scale-[2] w-7 mr-1" defaultChecked={parsedDefaultValue.crawl} />
          <label htmlFor={`${props.id}_crawl`} className="text-lg">見回り</label>
        </div>
        <div className="ml-4">
          <input type="checkbox" id={`${props.id}_capture`} className="scale-[2] w-7 mr-1" defaultChecked={parsedDefaultValue.capture} onChange={(e) => setIsCaptureSet(e.target.checked)}/>
          <label htmlFor={`${props.id}_capture`} className="text-lg">捕獲</label>
        </div>
      </div>
    
      {isCaptureSet ? (
        <>
          <div>
            <div>※ 捕獲を行った場合には以下の項目もチェックしてください。</div>
            <div className="flex mb-2 flex-wrap">
              <div className="mr-4 mb-2">
                <input type="checkbox" id={`${props.id}_own`} className="scale-[2] w-7 mr-1" defaultChecked={parsedDefaultValue.capture_type.own} />
                <label htmlFor={`${props.id}_own`} className="text-lg" >自身の罠で捕獲</label>
              </div>
              <div className="mr-4 mb-2">
                <input type="checkbox" id={`${props.id}_help`} className="scale-[2] w-7 mr-1" defaultChecked={parsedDefaultValue.capture_type.help} />
                <label htmlFor={`${props.id}_help`} className="text-lg" >捕獲手伝い</label>
              </div>
              <div>
                <input type="checkbox" id={`${props.id}_mistake`} className="scale-[2] w-7 mr-1" defaultChecked={parsedDefaultValue.capture_type.mistake} onChange={(e) => setIsMistake(e.target.checked)}/>
                <label htmlFor={`${props.id}_mistake`} className="text-lg" >錯誤捕獲</label>
              </div>
            </div>
          </div>
          {isMistake ? (
            <div>
              <div>※ 錯誤捕獲を行った場合には以下の項目も入力してください。</div>
              <InfoInput
                title='罠の種類'
                type='select'
                id={props.id + "_trap_type"}
                options={['くくりわな', '箱わな (脱出口有り)', '箱わな (脱出口無し)', '囲いわな']}
                defaultValue={parsedMistakeValue.trap_type}
              />

              <div className="px-4">
                <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
                  獣種
                </div>
                <div className="flex mb-2 flex-wrap">
                  <div className="mr-4 mb-2">
                    <input type="checkbox" id={`${props.id}_deer`} className="scale-[2] w-7 mr-1" defaultChecked={parsedMistakeValue.animal_type.deer} />
                    <label htmlFor={`${props.id}_deer`} className="text-lg" >ニホンジカ</label>
                  </div>
                  <div className="mr-4 mb-2">
                    <input type="checkbox" id={`${props.id}_serow`} className="scale-[2] w-7 mr-1" defaultChecked={parsedMistakeValue.animal_type.serow} />
                    <label htmlFor={`${props.id}_serow`} className="text-lg" >カモシカ</label>
                  </div>
                  <div className="mr-4 mb-2">
                    <input type="checkbox" id={`${props.id}_boar`} className="scale-[2] w-7 mr-1" defaultChecked={parsedMistakeValue.animal_type.boar} />
                    <label htmlFor={`${props.id}_boar`} className="text-lg" >ツキノワグマ</label>
                  </div>
                  <div>
                    <input type="checkbox" id={`${props.id}_other`} className="scale-[2] w-7 mr-1" defaultChecked={parsedMistakeValue.animal_type.other} onChange={(e) => setIsOther(e.target.checked)}/>
                    <label htmlFor={`${props.id}_other`} className="text-lg" >その他</label>
                  </div>
                </div>
                {isOther ? (
                  <TextInput 
                    type="text"
                    id={props.id + "_other_animal"}
                    defaultValue={`${parsedMistakeValue.animal_other}`}
                  />
                ) : <></>}
              </div>

              <div className="px-4">
                <div className='mt-[15px] mb-[5px] w-full text-justify text-lg font-bold text-text'>
                  頭数
                </div>
                <TextInput 
                  type="number"
                  id={props.id + "_head"}
                  defaultValue={`${parsedMistakeValue.head_count}`}
                />
              </div>

              <InfoInput
                title='対応'
                type='select'
                id={props.id + "_response"}
                options={['放獣', '市町村に依頼して捕獲']}
                defaultValue={parsedMistakeValue.response}
              />
            </div>
          ) : <></>}
        </>
      ) : <></>}
    </div>
  );
};

export default WorkDetailInput;