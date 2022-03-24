import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import { SERVER_URI } from "../../../utils/constants";
import { getAccessToken } from "../../../utils/currentUser";
import { alert, confirm } from "../../../utils/modal";
import FooterAdjustment from "../../atomos/footerAdjustment";
import RoundButton from "../../atomos/roundButton";
import TextInput from "../../atomos/TextInput";
import Footer from "../../organisms/footer";
import Header from "../../organisms/header";

interface CityAccount {
    id: string;
    city: string;
}

const CitySettingsTemplate: React.FunctionComponent = () => {
  const router = useRouter();
  const { currentUser } = useCurrentUser();

  const [cityUsers, setCityUsers] = useState<CityAccount[]>([]);
  const [filter, setFilter] = useState("");
  
  useEffect(() => {
    if(currentUser == null) 
      return;
              
    if(currentUser.userDepartment !== "K") {
      alert("権限エラー\nこのページにアクセスする権限がありません。");
      router.push("/map");
      return;
    }

    fetchUserData();
  }, [currentUser]);

  const fetchUserData = async () => {
    const res = await fetch(SERVER_URI + "/City/GetUsers", {
      headers: {
        'X-Access-Token': getAccessToken()
      }
    });

    if(res.status === 200) {
      setCityUsers(await res.json());
    } else {
      await alert("情報の取得中にエラーが発生しました。");
      router.push('/settings');
    }
  };

  const onClickDelete = async (id: string, city: string) => {
    if(await confirm("本当に" + id + " (" + city + ") の関連付け設定を削除しますか？")) {
      const res = await fetch(SERVER_URI + "/City/RemoveUser", {
        method: 'POST',
        body: JSON.stringify({
          "city": city,
          "id": id,
        }),
        headers: {
          'X-Access-Token': getAccessToken()
        }
      });

      if(res.status !== 200) {
        alert("エラーが発生しました。");
      } else {
        alert("関連付けを削除しました。");
      }
      await fetchUserData();
    }
  };

  return (
    <div>
      <Header color="primary">
        市町村設定
      </Header>
      <div className='mx-auto w-full max-w-[400px] bg-background py-3 px-3'>
        <div className="my-4">
          <RoundButton color="primary" onClick={() => router.push("/settings/city/add")}>
            関連付け設定の追加
          </RoundButton>
        </div>
        <div className="text-center text-xl font-bold text-text py-4">
            既存の関連付け設定の削除
        </div>
        <div className="mt-4 mb-3">
          <TextInput type="text" placeholder="アカウント名/市町村名 でフィルタリング" onChange={(e) => setFilter(e.target.value)}/>
        </div>
        <div className="border-border rounded-lg border-solid border-2 box-border p-2">
          <div className="overflow-y-scroll max-h-[550px]">
            <table className="w-full">
              <tr className="font-bold">
                <td className="w-[40%]">アカウント名</td>
                <td className="w-[35%]">市町村名</td>
                <td className="w-[20%]">操作</td>
              </tr>
              {cityUsers.filter(user=>user.city.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) || user.id.toLocaleLowerCase().includes(filter.toLocaleLowerCase())).map((user, i)=>(
                <tr className={"border-t-border border-t-2 h-12" + (i % 2 == 0 ? "" : " bg-[#d4d4d4]")} key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.city}</td>
                  <td>
                    <button type="button" className="bg-danger px-2 py-1 rounded-lg text-background font-bold" onClick={() => onClickDelete(user.id, user.city)}>
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
          <RoundButton onClick={() => router.push('/settings')} color="accent">
            &lt; 戻る
          </RoundButton>
        </Footer>
      </div>
    </div>
  );
};

export default CitySettingsTemplate;