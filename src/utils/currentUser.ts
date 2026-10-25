import { parseCookies, destroyCookie } from 'nookies';

import { User } from '../types/user';
import { SERVER_URI } from './constants';
import { getUserDepartment } from './gis';
import { decodeJwtPayload, isJwtExpired } from './jwt';

export const getAccessToken = (): string => {
  const cookies = parseCookies();
  if (cookies.jwt != null) {
    const token = cookies.jwt;
    // 有効期限だけ確認する。
    if (isJwtExpired(decodeJwtPayload(token))) {
      // 期限切れ・不正なトークンを削除する。
      destroyCookie(null, 'jwt');
      return '';
    } else {
      return token;
    }
  }
  return '';
};

// アクセストークンが(署名と時間的に)生きているかをチェックし、そこからUserクラスを生成する。
export const fetchCurrentUser = async (signal?: AbortSignal): Promise<User> => {
  const token = getAccessToken();
  const response = await fetch(SERVER_URI + '/Auth/VerifyToken', {
    method: 'GET',
    signal,
    headers: {
      'X-Access-Token': token,
    },
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  // JWTをパースして各種情報の取得
  const payload = decodeJwtPayload(token);
  if (typeof payload?.user !== 'string' || typeof payload.token !== 'string') {
    throw new Error('Invalid authentication token');
  }

  const user = payload.user;
  const gisToken = payload.token;
  const dept = getUserDepartment(user);

  return {
    userId: user,
    accessToken: gisToken,
    userDepartment: dept,
  };
};
