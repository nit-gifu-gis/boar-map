/* eslint-disable @next/next/no-img-element */
import { SERVER_URI } from '../../../utils/constants';
import { getAccessToken } from '../../../utils/currentUser';
import { ImageListViewProps } from './interface';

const ImageListView: React.FunctionComponent<ImageListViewProps> = ({
  imageIDs,
  objectURLs,
  confirmMode,
}) => {
  const imgIds = imageIDs == null ? [] : imageIDs;
  const objURLs = objectURLs == null ? [] : objectURLs;
  const confMode = confirmMode == null ? false : true;
  const imageCount = imgIds.length + objURLs.length;
  const img_class =
    imageCount === 1
      ? 'w-full text-center box-border'
      : 'w-full overflow-x-scroll whitespace-nowrap box-border flex items-center';
  const imgbox_class =
    imageCount === 1
      ? 'max-h-[400px] max-w-full border-solid border-2 border-border rounded-md box-border mx-auto'
      : 'flex-0-0-auto max-h-[400px] max-w-17/20 inline-block border-solid border-2 border-border rounded-md box-border image-between';
  const token = getAccessToken();
  let description: JSX.Element | null = null;
  let images: JSX.Element[] = [];

  if (confMode) {
    if (imageCount === 0) {
      // 画像0枚の時の処理
      description = <div className='text-center text-text'>画像は登録されません。</div>;
    } else {
      description = (
        <div className='text-center text-text'>{imageCount}枚の画像が登録されます。</div>
      );

      const server_images = imgIds.map((data, index) => {
        return (
          <img
            src={SERVER_URI + '/Image/GetImage?id=' + data + '&token=' + token}
            alt={'Uploaded image ' + (index + 1)}
            key={'Uploaded image ' + (index + 1)}
            className={imgbox_class}
          />
        );
      });

      const client_images = objURLs.map((data, index) => {
        return (
          <img
            src={data}
            alt={'Selected image ' + (index + 1)}
            key={'Selected image ' + (index + 1)}
            className={imgbox_class}
          />
        );
      });

      images = server_images.concat(client_images);
    }
  } else {
    if (imageCount === 0) {
      // 画像0枚の時の処理
      description = <div className='text-center text-small-text'>画像が登録されていません。</div>;
    } else {
      images = imgIds.map((data, index) => {
        return (
          <img
            src={SERVER_URI + '/Image/GetImage?id=' + data + '&token=' + token}
            alt={'Uploaded image ' + (index + 1)}
            key={'Uploaded image ' + (index + 1)}
            className={imgbox_class}
          />
        );
      });
    }
  }

  return (
    <div className='relative my-[10px] box-border w-full text-lg'>
      {description}
      <div className={imageCount === 0 ? '' : img_class}>{images}</div>
    </div>
  );
};

export default ImageListView;
