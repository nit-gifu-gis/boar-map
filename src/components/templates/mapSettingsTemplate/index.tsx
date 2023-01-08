import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import InfoInput from '../../molecules/infoInput';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';

const MapSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [radiusError, setRadiusError] = useState('');
  const [timeError, setTimeError] = useState('');
  const [message, setMessage] = useState('');
  const [, setMessageDeleteTimerId] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K' && currentUser.userDepartment !== 'D') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    const fetchSettings = async () => {
      const res = await fetch(SERVER_URI + '/Settings/Butanetsu', {
        headers: {
          'X-Access-Token': getAccessToken(),
        },
      });
      const settings = await res.json();
      const radius_input = document.getElementById('map_radius') as HTMLInputElement;
      const time_input = document.getElementById('map_time') as HTMLInputElement;

      radius_input.value = settings.radius;
      time_input.value = settings.month;
    };
    fetchSettings();

    return () => {
      setMessageDeleteTimerId((id) => {
        if (id != null) {
          clearTimeout(id);
        }
        return id;
      });
    };
  }, []);

  const onButanetsuUpdateClicked = () => {
    setRadiusError('');
    setTimeError('');
    const radius_input = document.getElementById('map_radius') as HTMLInputElement;
    const time_input = document.getElementById('map_time') as HTMLInputElement;

    let valid = true;
    if (radius_input.value == '') {
      setRadiusError('値が入力されていません。');
      valid = false;
    }
    if (time_input.value == '') {
      setTimeError('値が入力されていません。');
      valid = false;
    }
    const radius_val = parseInt(radius_input.value);
    const time_val = parseInt(time_input.value);
    if ((radius_input.value != '' && isNaN(radius_val)) || radius_val <= 0) {
      setRadiusError('無効な値が入力されました。');
      valid = false;
    }
    if ((time_input.value != '' && isNaN(time_val)) || time_val <= 0) {
      setTimeError('無効な値が入力されました。');
      valid = false;
    }

    if (!valid) {
      return;
    }

    setButtonDisabled(true);
    const settings_new = {
      radius: radius_val,
      month: time_val,
    };

    const updateTask = async () => {
      const res = await fetch(SERVER_URI + '/Settings/Butanetsu', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
        },
        body: JSON.stringify(settings_new),
      });
      const message = res.ok ? '設定を更新しました。' : `エラーが発生しました。(${res.status})`;
      setMessageDeleteTimerId((id) => {
        setMessage(message);

        if (id != null) clearTimeout(id);

        return setTimeout(() => {
          setMessage('');
        }, 4000);
      });

      setButtonDisabled(false);
    };
    updateTask();
  };

  return (
    <div>
      <Header color='primary'>マップ表示設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='text-2xl font-bold'>豚熱陽性高率エリア表示設定</div>
        <div className='box-border w-full rounded-xl border-2 border-solid border-border py-[10px] px-2'>
          <InfoInput type='number' id='map_radius' title='円の表示半径(km)' error={radiusError} />
          <InfoInput type='number' id='map_time' title='円の表示期間(月)' error={timeError} />
          <RoundButton color='primary' onClick={onButanetsuUpdateClicked} disabled={buttonDisabled}>
            保存
          </RoundButton>
          <div className='pt-3 text-center'>
            <span>{message}</span>
          </div>
        </div>
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton onClick={() => router.push('/settings')} color='accent'>
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default MapSettingsTemplate;
