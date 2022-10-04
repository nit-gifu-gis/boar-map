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

interface BranchInfo {
  name: string;
  area: string;
}

const ReportBranchSettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [branches, setBranches] = useState<BranchInfo[]>([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    fetchBranches();
  }, [currentUser]);

  const fetchBranches = async () => {
    const res = await fetch(SERVER_URI + '/Report/GetBranches', {
      headers: {
        'X-Access-Token': getAccessToken(),
      },
    });

    if (res.status === 200) {
      const json = await res.json();
      setBranches(json);
    } else {
      await alert('情報の取得中にエラーが発生しました。');
      router.push('/settings');
    }
  };

  const onClickDelete = async (name: string, area: string) => {
    if (await confirm('本当に' + name + ' (' + area + ') を削除しますか？')) {
      const res = await fetch(SERVER_URI + '/Report/RemoveBranch', {
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
      await fetchBranches();
    }
  };

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }
  }, [currentUser]);

  return (
    <div>
      <Header color='primary'>支部名リスト設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='my-4'>
          <RoundButton color='primary' onClick={() => router.push('/settings/report/branch/add')}>
            支部名の追加
          </RoundButton>
        </div>
        <div className='py-4 text-center text-xl font-bold text-text'>既存の支部名の削除</div>
        <div className='mt-4 mb-3'>
          <TextInput
            type='text'
            placeholder='支部名/地域 でフィルタリング'
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className='box-border rounded-lg border-2 border-solid border-border p-2'>
          <div className='max-h-[550px] overflow-y-scroll'>
            <table className='w-full'>
              <tr className='font-bold'>
                <td className='w-[40%]'>支部名</td>
                <td className='w-[35%]'>地域名</td>
                <td className='w-[20%]'>操作</td>
              </tr>
              {branches
                .filter(
                  (user) =>
                    user.area.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
                    user.name.toLocaleLowerCase().includes(filter.toLocaleLowerCase()),
                )
                .map((branch, i) => (
                  <tr
                    className={
                      'h-12 border-t-2 border-t-border' + (i % 2 == 0 ? '' : ' bg-[#d4d4d4]')
                    }
                    key={branch.name + ',' + branch.area}
                  >
                    <td>{branch.name}</td>
                    <td>{branch.area}</td>
                    <td>
                      <button
                        type='button'
                        className='rounded-lg bg-danger px-2 py-1 font-bold text-background'
                        onClick={() => onClickDelete(branch.name, branch.area)}
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

export default ReportBranchSettingsTemplate;
