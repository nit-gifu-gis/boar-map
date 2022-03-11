import { UserDepartment } from '../utils/gis';

type User = {
  userId: string;
  accessToken: string;
  userDepartment: UserDepartment | undefined;
};
