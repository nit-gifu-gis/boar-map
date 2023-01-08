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

interface ReportUserName {
  branch_name: string;
  branch_person: string;
  branch_area: string;
}

const ReportUserSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [filter, setFilter] = useState('');
  const [names, setNames] = useState<ReportUserName[]>([]);

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
    const res = await fetch(SERVER_URI + '/Report/GetUserNames', {
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });

    if (res.status === 200) {
      const json = await res.json();
      setNames(json);
    } else {
      await alert('情報の取得中にエラーが発生しました。');
      router.push('/settings');
    }
  };

  const onClickDelete = async (name: string, area: string, person: string) => {
    if (await confirm('本当に' + person + ' (' + name + '/' + area + ') を削除しますか？')) {
      const res = await fetch(SERVER_URI + '/Report/RemoveName', {
        method: 'POST',
        body: JSON.stringify({
          name: name,
          area: area,
          person: person,
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
      <Header color='primary'>所属者氏名設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='my-4'>
          <RoundButton color='primary' onClick={() => router.push('/settings/report/user/add')}>
            氏名の追加
          </RoundButton>
        </div>
        <div className='py-4 text-center text-xl font-bold text-text'>既存の氏名の削除</div>
        <div className='mt-4 mb-3'>
          <TextInput
            type='text'
            placeholder='氏名/支部名/地域名 でフィルタリング'
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className='box-border rounded-lg border-2 border-solid border-border p-2'>
          <div className='max-h-[550px] overflow-y-scroll'>
            <table className='w-full'>
              <tr className='font-bold'>
                <td className='w-[35%]'>氏名</td>
                <td className='w-[20%]'>支部名</td>
                <td className='w-[25%]'>地域名</td>
                <td className='w-[20%]'>操作</td>
              </tr>
              {names
                .filter(
                  (user) =>
                    user.branch_area.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    user.branch_person.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    user.branch_name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
                )
                .map((user, i) => (
                  <tr
                    className={
                      'h-12 border-t-2 border-t-border' + (i % 2 == 0 ? '' : ' bg-[#d4d4d4]')
                    }
                    key={user.branch_person + ',' + user.branch_name + ',' + user.branch_area}
                  >
                    <td>{user.branch_person}</td>
                    <td>{user.branch_name}</td>
                    <td>{user.branch_area}</td>
                    <td>
                      <button
                        type='button'
                        className='rounded-lg bg-danger px-2 py-1 font-bold text-background'
                        onClick={() =>
                          onClickDelete(user.branch_name, user.branch_area, user.branch_person)
                        }
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
          <RoundButton onClick={() => router.push('/settings/report')} color='accent'>
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default ReportUserSettingsTemplate;
