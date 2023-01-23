import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { alert, confirm } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import InfoInput from '../../molecules/infoInput';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';

interface Response {
  area: string[];
  trader: Record<string, ResponseObj[]>;
}

interface ResponseObj {
  name: string;
  area: string;
  code: string;
}

const JibieUserAddTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [isLoading, setLoading] = useState(false);

  const [traders, setTraders] = useState<Response>({ area: [], trader: {} });
  const [area, setArea] = useState('');
  const [currentList, setCurrentList] = useState<ResponseObj[]>([]);
  const [, setSelectedIndex] = useState(0);

  const fetchData = async () => {
    const res = await fetch(SERVER_URI + '/Jibie/List', {
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });
    const json = await res.json();
    setTraders(json);
  };

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (area !== '' && traders.trader[area] != null) {
      setCurrentList(traders.trader[area]);
      return;
    }

    const ResponseObjs: ResponseObj[] = [];
    traders.area.forEach((v) => {
      const l = traders.trader[v];
      l.forEach((vv) => {
        ResponseObjs.push(vv);
      });
    });

    setCurrentList(ResponseObjs);
    setSelectedIndex(0);
  }, [traders, area]);

  const onSelectionChanged = () => {
    const form = document.getElementById('registerform') as HTMLFormElement;
    const area = form.trader_area.options[form.trader_area.selectedIndex].value;
    setArea(area);
  };

  const onTraderChanged = () => {
    const form = document.getElementById('registerform') as HTMLFormElement;
    setSelectedIndex(form.trader_name.selectedIndex);
  };

  const createData = async () => {
    if (await confirm('この内容で登録してよろしいですか？')) {
      setLoading(true);
      const form = document.getElementById('registerform') as HTMLFormElement;
      const traders = await new Promise<ResponseObj[]>((resolve) =>
        setCurrentList((list) => {
          resolve(list);
          return list;
        }),
      );
      const traderIndex = await new Promise<number>((resolve) =>
        setSelectedIndex((index) => {
          resolve(index);
          return index;
        }),
      );
      const trader = traders[traderIndex];
      const user = form.trader_user.value;
      if (!user || !trader) {
        alert('未入力の項目があります。ご確認ください。');
        return;
      }

      const data = {
        name: trader.name,
        area: trader.area,
        id: user,
      };

      const res = await fetch(SERVER_URI + '/Jibie/AddUser', {
        method: 'POST',
        headers: {
          'X-Access-Token': getAccessToken(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      setLoading(false);

      if (res.status === 200) {
        await alert('登録が完了しました。');
        router.push('/settings/jibie/user');
      } else if (res.status === 403) {
        alert('データを追加する権限がありません。');
      } else if (res.status === 404) {
        alert('該当するデータが見つかりませんでした。');
      } else if (res.status === 400) {
        alert('重複する内容がすでに存在します。');
      }
    }
  };

  return (
    <div>
      <Header color='primary'>ジビエ業者の関連付け</Header>

      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>内容を入力してください。</div>
        <form id='registerform' onSubmit={(e) => e.preventDefault()}>
          <InfoInput
            type='select'
            title='地域（圏域）'
            options={['', '岐阜', '西濃', '中濃', '東濃', '飛騨']}
            id='trader_area'
            onChange={onSelectionChanged}
          />
          <InfoInput
            type='select'
            title='ジビエ事業者名'
            options={currentList.map((v) => `${v.name} (${v.area})`)}
            id='trader_name'
            onChange={onTraderChanged}
          />
          <InfoInput type='text' title='アカウント名' id='trader_user' required={true} />
        </form>
      </div>

      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton onClick={() => router.push('/settings/jibie/user')} color='accent'>
            &lt; 戻る
          </RoundButton>
          <RoundButton onClick={createData} color='primary' disabled={isLoading}>
            登録 &gt;
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default JibieUserAddTemplate;
