import { User } from '../types/user';
import { strEnum } from './strEnum';

const UserDepartments = strEnum(['T', 'U', 'S', 'R', 'W', 'K', 'D', 'J', 'H', 'Y']);
export type UserDepartment = keyof typeof UserDepartments;

// ユーザーIdから所属を取得する
export const getUserDepartment = (userId: string): UserDepartment | undefined => {
  const idTop = userId.substr(0, 1).toUpperCase();
  // 権限一覧にあるかチェック
  if (idTop in UserDepartments) return idTop as UserDepartment;
  return undefined;
};

// 一覧表を閲覧する権限を所持しているかを確認する。
// (どの項目にアクセスできるかは関係なく、ページ自体のアクセス制御用)
export const hasListPermission = (user: User): boolean => {
  return (
    ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'D'].indexOf(user.userDepartment as string) !== -1
  );
};

export type LayerType = 'boar' | 'trap' | 'vaccine' | 'youton' | 'butanetsu' | 'report';

const READ_PERMISSION: { [type in LayerType]: Array<UserDepartment> } = {
  boar: ['T', 'U', 'H', 'J', 'R', 'S', 'K', 'D'],
  trap: ['T', 'U', 'H', 'R', 'S', 'K', 'D'],
  vaccine: ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'Y', 'D'],
  youton: ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'Y', 'D'],
  butanetsu: ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'Y', 'D'],
  report: ['T', 'R', 'K', 'D'],
};

const WRITE_PERMISSION: { [type in LayerType]: Array<UserDepartment> } = {
  boar: ['T', 'U', 'H', 'J', 'S', 'K', 'D'],
  trap: ['T', 'U', 'H', 'S', 'K', 'D'],
  vaccine: ['W', 'K', 'D'],
  youton: ['K', 'D'],
  butanetsu: ['K', 'D'],
  report: ['T', 'K', 'D'],
};

export const hasReadPermission = (type: LayerType, user: User) => {
  if (user.userDepartment == null) return false;
  return READ_PERMISSION[type].indexOf(user.userDepartment) !== -1;
};

export const hasWritePermission = (type: LayerType, user: User) => {
  if (user.userDepartment == null) return false;
  return WRITE_PERMISSION[type].indexOf(user.userDepartment) !== -1;
};

// Routerで渡されたデータ型とバージョンから、サーバーにクエリをするときに使用するデータ型に変換する
export const toServerType = (type: string, version: string): string => {
  switch (type) {
    case 'いのしし捕獲地点':
      if (version == 'v1') {
        return 'boar-1';
      } else if (version == 'v2') {
        return 'boar-2';
      } else {
        return '';
      }
    case 'わな設置地点':
      return 'trap';
    case 'ワクチン散布地点':
      return 'vaccine';
    case '作業日報':
      return 'report';
    case '豚熱陽性高率エリア':
      return 'butanetsu';
    case '養豚場':
      return 'youton';
  }
  return '';
};
