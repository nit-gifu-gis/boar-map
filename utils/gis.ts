// GISのデータ周りの管理

import { strEnum } from "./utils";

// サーバーURI
export const SERVER_URI = "https://gis-dev.junki-t.net/v1"; // 本番
// export const SERVER_URI = "https://localhost"; // 開発用ローカル

// ユーザーデータ
export type UserId = string;
export type AccessToken = string;
const UserDepartment = strEnum(['T', 'U', 'S', 'R', 'W', 'K', 'D']);
export type UserDepartment = keyof typeof UserDepartment;
export type UserData = {
  userId: UserId;
  accessToken: AccessToken;
  department: UserDepartment;
};

// ユーザーデータ取得周り
export const getUserData = (): UserData | undefined => {
  // クッキーから取ってくる
  if (process.browser) {
    // cookieを{key: "key", value: "value"}の配列にする
    const cookies = document.cookie
      .split(";")
      .map(c => {
        const content = c.split("=");
        const key = content[0].replace(" ", "");
        const value = content[1].replace(" ", "");
        return { key, value };
      });
    // 各種パラメータを取得
    const userId = cookies.find(c => c.key === "user_id").value;
    const token = cookies.find(c => c.key === "access_token").value;
    const department = getUserDepartment(userId);
    if (!userId || !token || !department) return undefined;
    return {
      userId: userId,
      accessToken: token,
      department: department
    };
  } else {
    return undefined;
  }
}

// ユーザーIdから所属を取得する
const getUserDepartment = (userId: string): UserDepartment | undefined => {
  // 開発用アカウント
  if (userId === "tyousa") return "T";
  if (userId === "yuugai") return "U";
  if (userId === "shityouson") return "S";
  if (userId === "trap") return "W";
  if (userId === "vaccine") return "W";
  if (userId === "pref") return "K";
  if (userId === "ryouyuukai") return "R";
  if (userId === "wakuchin") return "W";
  // 一般アカウント
  const idTop = userId.substr(0, 1).toUpperCase();
  // 権限一覧にあるかチェック
  if (idTop in UserDepartment) return idTop as UserDepartment;
  return undefined;
}


// レイヤーの種類
export type LayerType = 'boar' | 'trap' | 'vaccine';
const BOAR_LAYER_ID = 5000008;
const TRAP_LAYER_ID = 5000009;
const VACCINE_LAYER_ID = 5000010;
const BOAR_DEMO_LAYER_ID = 5000612;
const TRAP_DEMO_LAYER_ID = 5000613;
const VACCINE_DEMO_LAYER_ID = 5000614;
export type LayerId = number;

// レイヤーIDを取得する
export const getLayerId = (type: LayerType): LayerId | undefined => {
  const userData = getUserData();
  // userDataが取得できない場合はundefined
  if (!userData) return undefined;

  // departmentがDのときは
  if (userData.department === "D") {
    const layers: { [type in LayerType]: LayerId } = {
      boar: BOAR_DEMO_LAYER_ID,
      trap: TRAP_DEMO_LAYER_ID,
      vaccine: VACCINE_DEMO_LAYER_ID
    };
    return layers[type];
  }

  // 通常は
  const layers: { [type in LayerType]: LayerId } = {
    boar: BOAR_LAYER_ID,
    trap: TRAP_LAYER_ID,
    vaccine: VACCINE_LAYER_ID
  };
  return layers[type];
}


// 読み取り権限チェック
const READ_PERMISSION: { [type in LayerType]: Array<UserDepartment> } = {
  boar: ['T', 'U', 'S', 'R', 'W', 'K', 'D'],
  trap: ['T', 'U', 'S', 'R', 'W', 'K', 'D'],
  vaccine: ['W', 'K', 'D']
};

export const hasReadPermission = (type: LayerType) => {
  const userData = getUserData();
  if (!userData) return false;
  return READ_PERMISSION[type].indexOf(userData.department) !== -1;
};

// 書き込み権限チェック
const WRITE_PERMISSION: { [type in LayerType]: Array<UserDepartment> } = {
  boar: ['T', 'U', 'S', 'R', 'K', 'D'],
  trap: ['T', 'U', 'S', 'R', 'K', 'D'],
  vaccine: ['W', 'K', 'D']
};

export const hasWritePermission = (type: LayerType) => {
  const userData = getUserData();
  if (!userData) return false;
  return WRITE_PERMISSION[type].indexOf(userData.department) !== -1;
}

// 一覧表権限チェック
const LIST_PERMISSION: { [type in LayerType]: Array<UserDepartment> } = {
  boar: ['S', 'R', 'K'],
  trap: ['K'],        // 将来のための予約
  vaccine: ['W', 'K'] // 将来のための予約
}

export const hasListPermission = (type: LayerType) => {
  const userData = getUserData();
  if (!userData) return false;
  return LIST_PERMISSION[type].indexOf(userData.department) !== -1;
}