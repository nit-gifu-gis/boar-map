import { useRouter } from "next/router";
import { useEffect } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { alert } from "../../../utils/modal";
import RoundButton from "../../atomos/roundButton";
import Header from "../../organisms/header";

const SettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if(currentUser == null) 
      return;
            
    if(currentUser.userDepartment !== "K") {
      alert("権限エラー\nこのページにアクセスする権限がありません。");
      router.push("/map");
      return;
    }
  }, [currentUser]);

  const settings = [
    {
      "path": "/settings/jibie",
      "title": "ジビエ業者設定"
    },   
    {
      "path": "/settings/report",
      "title": "作業日報設定"
    },   
    {
      "path": "/settings/city",
      "title": "市町村設定"
    }
  ];

  return (
    <div>
      <Header color="primary">
        サイト設定
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3'>
        <div className='mx-[15px] mt-2 text-justify'>設定する項目を選択してください。</div>
        {settings.map(s => (
          <div key={s.path} className="my-5">
            <RoundButton color="primary" onClick={() => router.push(s.path)}>
              {s.title}
            </RoundButton>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SettingsTemplate;