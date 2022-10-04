import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { alert, confirm } from '../../../utils/modal';
import FooterAdjustment from '../../atomos/footerAdjustment';
import RoundButton from '../../atomos/roundButton';
import TextInput from '../../atomos/TextInput';
import Footer from '../../organisms/footer';
import Header from '../../organisms/header';

interface JibieTraderUser {
  user: string;
  area: string;
  name: string;
}

const JibieUserSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [users, setUsers] = useState<JibieTraderUser[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    fetchUsers();
  }, [currentUser]);

  const fetchUsers = async () => {
    const res = await fetch(SERVER_URI + '/Jibie/GetUsers', {
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });

    if (res.status === 200) {
      setUsers(await res.json());
    } else {
      await alert('情報の取得中にエラーが発生しました。');
      router.push('/settings');
    }
  };

  const onClickDelete = async (user: string, area: string, name: string) => {
    if (await confirm('本当に' + user + ' (' + name + '/' + area + ') を削除しますか？')) {
      const res = await fetch(SERVER_URI + '/Jibie/RemoveUser', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          area: area,
          id: user,
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
      await fetchUsers();
    }
  };

  return (
    <div>
      <Header color='primary'>ジビエ業者関連付け設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='my-4'>
          <RoundButton color='primary' onClick={() => router.push('/settings/jibie/user/add')}>
            関連付け設定の追加
          </RoundButton>
        </div>
        <div className='py-4 text-center text-xl font-bold text-text'>既存の関連付け設定の削除</div>
        <div className='mt-4 mb-3'>
          <TextInput
            type='text'
            placeholder='アカウント名/事業者名/地域 でフィルタリング'
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className='box-border rounded-lg border-2 border-solid border-border p-2'>
          <div className='max-h-[550px] overflow-y-scroll'>
            <table className='w-full'>
              <tr className='font-bold'>
                <td className='w-[35%]'>アカウント名</td>
                <td className='w-[20%]'>事業者名</td>
                <td className='w-[25%]'>地域名</td>
                <td className='w-[20%]'>操作</td>
              </tr>
              {users
                .filter(
                  (user) =>
                    user.area.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    user.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    user.user.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
                )
                .map((user, i) => (
                  <tr
                    className={
                      'h-12 border-t-2 border-t-border' + (i % 2 == 0 ? '' : ' bg-[#d4d4d4]')
                    }
                    key={user.user}
                  >
                    <td>{user.user}</td>
                    <td>{user.name}</td>
                    <td>{user.area}</td>
                    <td>
                      <button
                        type='button'
                        className='rounded-lg bg-danger px-2 py-1 font-bold text-background'
                        onClick={() => onClickDelete(user.user, user.area, user.name)}
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

export default JibieUserSettingsTemplate;
