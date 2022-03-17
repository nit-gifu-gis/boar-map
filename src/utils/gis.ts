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
  return ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K'].indexOf(user.userDepartment as string) !== -1;
};

export type LayerType = 'boar' | 'trap' | 'vaccine' | 'youton' | 'butanetsu' | 'report';

const READ_PERMISSION: { [type in LayerType]: Array<UserDepartment> } = {
  boar: ['T', 'U', 'H', 'J', 'R', 'S', 'K'],
  trap: ['T', 'U', 'H', 'R', 'S', 'K'],
  vaccine: ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'Y'],
  youton: ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'Y'],
  butanetsu: ['T', 'U', 'H', 'J', 'R', 'S', 'W', 'K', 'Y'],
  report: ['T', 'R', 'K'],
};
export const hasReadPermission = (type: LayerType, user: User) => {
  if (user.userDepartment == null) return false;
  return READ_PERMISSION[type].indexOf(user.userDepartment) !== -1;
};
