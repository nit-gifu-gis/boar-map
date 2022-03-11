import fs from 'fs';
import path from 'path';

export type VersionInformation = {
  latestNumber: string;
  allText: string;
};

// getStaticPropsからじゃないと使えない(OS側のファイルシステムで触っているため)
export const getVersionInfo = (): VersionInformation => {
  const versionFile = path.join(process.cwd(), 'public', 'history.md');
  if (fs.existsSync(versionFile)) {
    const f = fs.readFileSync(versionFile).toString();
    const pattern = /^### .+$/m;
    const result = f.match(pattern);
    if (result != null) {
      const latest = result[0].replace('### ', '');
      return {
        latestNumber: latest,
        allText: f,
      };
    }
  }

  return {
    latestNumber: 'Error',
    allText: 'Error',
  };
};
