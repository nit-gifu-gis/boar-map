import { parseCookies, destroyCookie } from 'nookies';
import { User } from '../types/user';
import { SERVER_URI } from './constants';
import { getUserDepartment } from './gis';

export const getAccessToken = (): string => {
  const cookies = parseCookies();
  const now = Math.floor(new Date().getTime() / 1000);
  if (cookies.jwt != null) {
    const token = cookies.jwt;
    // 有効期限だけ確認する。
    const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString();
    const payload = JSON.parse(payloadStr);
    if (payload.exp <= now) {
      // トークンの期限が切れているから削除する
      destroyCookie(null, 'jwt');
      return '';
    } else {
      return token;
    }
  }
  return '';
};

// アクセストークンが(署名と時間的に)生きているかをチェックし、そこからUserクラスを生成する。
export const fetchCurrentUser = async (): Promise<User> => {
  const token = getAccessToken();
  const response = await fetch(SERVER_URI + '/Auth/VerifyToken', {
    method: 'GET',
    headers: {
      'X-Access-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  // JWTをパースして各種情報の取得
  const payloadStr = Buffer.from(token.split('.')[1], 'base64').toString();
  const payload = JSON.parse(payloadStr);

  const user = payload['user'] as string;
  const gisToken = payload['token'] as string;
  const dept = getUserDepartment(user);

  return {
    userId: user,
    accessToken: gisToken,
    userDepartment: dept,
  };
};
