import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { confirm, alert } from '../../../utils/modal';
import { TraderInfo } from '../../atomos/boarDetailForm/interface';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import TextInput from '../../atomos/TextInput';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';

const JibieTraderSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [traders, setTraders] = useState<TraderInfo[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    fetchTraders();
  }, [currentUser]);

  const fetchTraders = async () => {
    const res = await fetch(SERVER_URI + '/Jibie/List', {
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });

    if (res.status === 200) {
      const json = await res.json();
      let list: TraderInfo[] = [];
      json['area'].forEach((area: string) => {
        list = list.concat(json['trader'][area]);
      });
      setTraders(list);
    } else {
      await alert('情報の取得中にエラーが発生しました。');
      router.push('/settings');
    }
  };

  const onClickDelete = async (name: string, area: string | undefined, code: string) => {
    if (await confirm('本当に' + name + ' (' + area + '/' + code + ') を削除しますか？')) {
      const res = await fetch(SERVER_URI + '/Jibie/RemoveTrader', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          area: area,
        }),
        headers: {
          'X-Access-Token': getAccessToken(),
        },
      });

      if (res.status !== 200) {
        alert('エラーが発生しました。');
      } else {
        alert('削除しました。');
      }
      await fetchTraders();
    }
  };

  return (
    <div>
      <Header color='primary'>ジビエ業者リスト設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='my-4'>
          <RoundButton color='primary' onClick={() => router.push('/settings/jibie/trader/add')}>
            事業者の追加
          </RoundButton>
        </div>
        <div className='py-4 text-center text-xl font-bold text-text'>既存の事業者の削除</div>
        <div className='mt-4 mb-3'>
          <TextInput
            type='text'
            placeholder='事業者名/地域名/固有番号 でフィルタリング'
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className='box-border rounded-lg border-2 border-solid border-border p-2'>
          <div className='max-h-[550px] overflow-y-scroll'>
            <table className='w-full'>
              <tr className='font-bold'>
                <td className='w-[35%]'>事業者名</td>
                <td className='w-[20%]'>地域</td>
                <td className='w-[25%]'>固有番号</td>
                <td className='w-[20%]'>操作</td>
              </tr>
              {traders
                .filter(
                  (trader) =>
                    trader.area?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    trader.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    trader.code.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
                )
                .map((trader, i) => (
                  <tr
                    className={
                      'h-12 border-t-2 border-t-border' + (i % 2 == 0 ? '' : ' bg-[#d4d4d4]')
                    }
                    key={trader.code}
                  >
                    <td>{trader.name}</td>
                    <td>{trader.area}</td>
                    <td>{trader.code}</td>
                    <td>
                      <button
                        type='button'
                        className='rounded-lg bg-danger px-2 py-1 font-bold text-background'
                        onClick={() => onClickDelete(trader.name, trader.area, trader.code)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
            </table>
          </div>
        </div>
      </div>
      <FooterAdjustment />
      <div className='fixed bottom-0 w-full'>
        <Footer>
          <RoundButton onClick={() => router.push('/settings/jibie')} color='accent'>
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default JibieTraderSettingsTemplate;
