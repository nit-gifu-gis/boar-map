import { InfoTypeItemTextProps } from './interface';

const InfoTypeItemText: React.FunctionComponent<InfoTypeItemTextProps> = ({ text, selected }) => {
  return (
    <span
      className={
        'ml-3 flex h-9 items-center justify-center text-2xl ' +
        (selected ? 'font-bold text-primary' : '')
      }
    >
      {text}
    </span>
  );
};

export default InfoTypeItemText;
