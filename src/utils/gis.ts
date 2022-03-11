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
