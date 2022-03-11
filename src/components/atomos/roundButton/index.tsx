import { RoundButtonProps } from './interface';

const RoundButton: React.FunctionComponent<RoundButtonProps> = (props) => {
  let bgColor = '';
  switch (props.color) {
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
  }
  if (props.disabled) bgColor = 'bg-disabled';

  return (
    <button
      className={
        'button-shadow active:button-shadow-active box-border w-full rounded-rd py-2 px-5 text-center text-xl font-bold text-background ' +
        bgColor
      }
      onClick={props.onClick?.bind(this)}
      disabled={props.disabled}
    >
      {props.children}
    </button>
  );
};

export default RoundButton;
