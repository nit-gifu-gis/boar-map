import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import RoundButton from '../../atomos/roundButton';
import Header from '../../organisms/header';

const SettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();
  const [settings, setSettings] = useState<Record<string, string>[]>([]);

  useEffect(() => {
    if (currentUser == null) return;

    if (currentUser.userDepartment !== 'K' && currentUser.userDepartment !== 'D') {
      alert('権限エラー\nこのページにアクセスする権限がありません。');
      router.push('/map');
      return;
    }

    if (settings.length === 0) {
      const s = [];
      s.push({
        path: '/settings/map',
        title: 'マップ設定',
      });

      if (currentUser.userDepartment === 'K') {
        s.push({
          path: '/dummy-spacer-1',
          title: '',
        });

        s.push({
          path: '/settings/jibie',
          title: 'ジビエ業者設定',
        });

        s.push({
          path: '/settings/report',
          title: '作業日報設定',
        });

        s.push({
          path: '/settings/city',
          title: '市町村設定',
        });

        s.push({
          path: '/dummy-spacer-1',
          title: '',
        });

        s.push({
          path: '/settings/notice',
          title: 'お知らせ設定',
        });
      }

      setSettings(s);
    }
  }, [currentUser, settings]);

  return (
    <div>
      <Header color='primary'>サイト設定</Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>設定する項目を選択してください。</div>
        {settings.map((s) => (
          <div key={s.path} className='my-5'>
            {s.title == '' ? (
              <div className='py-1'></div>
            ) : (
              <RoundButton color='primary' onClick={() => router.push(s.path)}>
                {s.title}
              </RoundButton>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsTemplate;