import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";
import { useEffect, useState } from "react";
import FooterAdjustment from "../../atomos/footerAdjustment";
import RoundButton from "../../atomos/roundButton";
import InfoInput from "../../molecules/infoInput";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";

const MapSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();

  const [radiusError, setRadiusError] = useState("");
  const [timeError, setTimeError] = useState("");
  const [message, setMessage] = useState("");
  const [, setMessageDeleteTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const cookies = parseCookies();
    const settings = cookies['butanetsu'] != null ? JSON.parse(cookies['butanetsu']) : {
      area: 10,
      month: 5,
    };
    const radius_input = document.getElementById('map_radius') as HTMLInputElement;
    const time_input = document.getElementById('map_time') as HTMLInputElement;

    radius_input.value = settings.area;
    time_input.value = settings.month;

    return (() => {
      setMessageDeleteTimerId(id => {
        if(id != null) {
          clearTimeout(id);
        }
        return id;
      });
    });
  }, []);

  const onButanetsuUpdateClicked = () => {
    setRadiusError("");
    setTimeError("");
    const radius_input = document.getElementById('map_radius') as HTMLInputElement;
    const time_input = document.getElementById('map_time') as HTMLInputElement;

    let valid = true;
    if(radius_input.value == "") {
      setRadiusError("値が入力されていません。");
      valid = false;
    }
    if(time_input.value == "") {
      setTimeError("値が入力されていません。");
      valid = false;
    }
    const radius_val = parseInt(radius_input.value);
    const time_val = parseInt(time_input.value);
    if(radius_input.value != "" && isNaN(radius_val) || radius_val <= 0) {
      setRadiusError("無効な値が入力されました。");
      valid = false;
    }
    if(time_input.value != "" && isNaN(time_val) || time_val <= 0) {
      setTimeError("無効な値が入力されました。");
      valid = false;
    }

    if(!valid) {
      return;
    }

    const settings_new = {
      area: radius_val,
      month: time_val,
    };
    setCookie(null, "butanetsu", JSON.stringify(settings_new));
    
    setMessageDeleteTimerId(id => {
      setMessage("設定を更新しました。");

      if(id != null)
        clearTimeout(id);

      return setTimeout(() => {
        setMessage("");
      }, 3000);
    });
  };
    
  return (
    <div>
      <Header color="primary">
        マップ表示設定
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className="text-2xl font-bold">豚熱陽性確認地点表示設定</div>
        <div className="box-border border-solid border-2 border-border rounded-xl py-[10px] px-2 w-full">
          <InfoInput type="number" id="map_radius" title="円の表示半径(km)" error={radiusError} />
          <InfoInput type="number" id="map_time" title="円の表示期間(月)" error={timeError} />
          <RoundButton color="primary" onClick={onButanetsuUpdateClicked}>
            保存
          </RoundButton>
          <div className="text-center pt-3">
            <span>
              {message}
            </span>
          </div>
        </div>
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton onClick={() => router.push('/settings')} color="accent">
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default MapSettingsTemplate;