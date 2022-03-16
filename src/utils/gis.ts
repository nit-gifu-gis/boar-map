import { User } from '../types/user';
import { strEnum } from './strEnum';

const UserDepartments = strEnum(['T', 'U', 'S', 'R', 'W', 'K', 'D', 'J']);
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
// (K,R,S,D,J,W)
export const hasListPermission = (user: User): boolean => {
  return ['K', 'R', 'S', 'D', 'J', 'W'].indexOf(user.userDepartment as string) !== -1;
};
