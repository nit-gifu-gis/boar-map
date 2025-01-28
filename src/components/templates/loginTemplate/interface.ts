import { VersionInformation } from '../../../utils/version';

export interface LoginProps {
  version: VersionInformation;
}

export interface Notice {
  title: string;
  content: string;
}