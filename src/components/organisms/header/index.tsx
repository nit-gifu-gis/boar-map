import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../../hooks/useCurrentUser';
import { hasListPermission } from '../../../utils/gis';
import { HeaderProps } from './interface';
import { confirm } from '../../../utils/modal';
import { useSetRecoilState } from 'recoil';
import { useRouter } from 'next/router';
import { currentUserState } from '../../../states/currentUser';
import { getAccessToken } from '../../../utils/currentUser';
import { destroyCookie } from 'nookies';
import { SERVER_URI } from '../../../utils/constants';
import { getFormUrl } from '../../../utils/questionaire';

const Header: React.FunctionComponent<HeaderProps> = (props) => {
  const { currentUser, isAuthChecking } = useCurrentUser();
  const [isOpen, setOpen] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const setCurrentUser = useSetRecoilState(currentUserState);
  const router = useRouter();

  const isChildrenString = typeof props.children === 'string';
  const fontSize =
    isChildrenString && (props.children as string).length >= 7 ? 'text-2xl' : 'text-3xl';
  const bgColor = ((color: typeof props.color) => {
    let bgColor = '';
    switch (color) {
      case 'primary':
        bgColor = 'bg-primary';
        break;
      case 'accent':
        bgColor = 'bg-accent';
        break;
      case 'danger':
        bgColor = 'bg-danger';
        break;
      case 'excel':
        bgColor = 'bg-excel';
        break;
      case 'boar':
        bgColor = 'bg-boar';
        break;
      case 'trap':
        bgColor = 'bg-trap';
        break;
      case 'vaccine':
        bgColor = 'bg-vaccine';
        break;
      case 'bg':
        bgColor = 'bg-background';
        break;
    }
    return bgColor;
  })(props.color == undefined ? 'primary' : props.color);

  useEffect(() => {
    if (currentUser === undefined) return;
    setFormUrl(getFormUrl(currentUser));
  }, [currentUser]);

  const onLogoutClicked = async () => {
    if (await confirm('本当にログアウトしてよろしいですか？')) {
      const token = getAccessToken();
      // アクセストークン削除の結果にかかわらずログアウト
      const response = await fetch(SERVER_URI + '/Auth/DeleteToken', {
        method: 'GET',
        headers: {
          'X-Access-Token': token,
        },
      });
      if (!response.ok) {
        console.error((await response.json())['error']);
      }
      destroyCookie(null, 'jwt');
      setCurrentUser(null);
      router.push('/login');
    }
  };

  const menuItems: JSX.Element[] = [];
  if (!isAuthChecking && currentUser != null) {
    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_map'
      >
        <Link href='/map'>
          <a className='text-14pt text-background no-underline'>マップ</a>
        </Link>
      </div>,
    );

    if (hasListPermission(currentUser)) {
      menuItems.push(
        <div
          className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
          key='menu_list'
        >
          <Link href='/list'>
            <a className='text-14pt text-background no-underline'>一覧表</a>
          </Link>
        </div>,
      );
    }

    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_questionaire'
      >
        <Link href={formUrl}>
          <a
            className='text-14pt text-background no-underline'
            target='_blank'
            rel='noopener noreferrer'
          >
            アンケート
          </a>
        </Link>
      </div>,
    );

    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_version'
      >
        <Link href='/version'>
          <a className='text-14pt text-background no-underline'>バージョン情報</a>
        </Link>
      </div>,
    );

    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_trace'
      >
        <Link href='/trace'>
          <a className='text-14pt text-background no-underline'>履歴管理システム</a>
        </Link>
      </div>,
    );

    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_logout'
      >
        <Link href='#'>
          <a
            className='text-14pt text-background no-underline'
            onClick={onLogoutClicked.bind(this)}
          >
            ログアウト
          </a>
        </Link>
      </div>,
    );
  } else if (!isAuthChecking && currentUser == null) {
    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_top'
      >
        <Link href='/'>
          <a className='text-14pt text-background no-underline'>トップページ</a>
        </Link>
      </div>,
    );
    menuItems.push(
      <div
        className='m-auto flex h-menu w-9/10 items-center justify-center border-t border-solid border-background'
        key='menu_trace'
      >
        <Link href='/trace'>
          <a className='text-14pt text-background no-underline'>履歴管理システム</a>
        </Link>
      </div>,
    );
  }

  return (
    <div className='z-50 h-header w-full'>
      <div className='h-header w-full'></div>
      <div className='fixed top-0 left-0 z-50 w-full'>
        <div className={'shadow-5 relative z-10 h-header w-full ' + bgColor}>
          <div className={'flex h-full w-full items-center text-center ' + fontSize}>
            <div className='w-full font-bold text-background'>{props.children}</div>
          </div>
          {!isAuthChecking ? (
            <div
              className={
                'active:active-dark absolute right-3 top-2.5 box-content flex h-10 w-10 cursor-pointer items-center rounded-md border-x border-y border-solid border-background ' +
                bgColor
              }
              onClick={() => {
                setOpen(!isOpen);
              }}
            >
              <span className={'hamburger-line ' + (isOpen ? 'rotate-45' : 'top-2.5')}></span>
              <span className={'hamburger-line ' + (isOpen ? 'scale-0' : 'top-4.5')}></span>
              <span className={'hamburger-line ' + (isOpen ? '-rotate-45' : 'top-6.5')}></span>
            </div>
          ) : (
            <></>
          )}
          <div
            className={
              bgColor +
              ' ' +
              (isOpen ? 'header-anim-close max-h-screen' : 'header-anim-open max-h-0')
            }
          >
            <div
              className={
                'overflow-y-hidden ' +
                (isOpen ? 'header-anim-close opacity-1' : 'header-anim-open opacity-0')
              }
            >
              <div className={isOpen ? 'block' : 'hidden'}>{menuItems}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
