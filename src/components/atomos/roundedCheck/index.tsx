import { RoundedCheckProps } from './interface';

const RoundedCheck: React.FunctionComponent<RoundedCheckProps> = ({ checked }) => {
  return (
    <div
      className={
        'flex h-6 w-6 items-center justify-center rounded-xl border-2 border-solid ' +
        (checked ? 'border-primary' : 'border-small-text')
      }
    >
      <div
        className={'box-border h-[14px] w-[14px] rounded-xl ' + (checked ? 'bg-primary' : '')}
      ></div>
    </div>
  );
};

export default RoundedCheck;
