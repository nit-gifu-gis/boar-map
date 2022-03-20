import { InfoTextProps } from './interface';

const InfoText: React.FunctionComponent<InfoTextProps> = (props) => {
  return (
    <div
      className={
        'my-[10px] w-full whitespace-pre-wrap text-justify text-[26px] ' +
        (props.is_gray ? 'text-small-text' : 'text-text')
      }
    >
      <div>{props.children}</div>
    </div>
  );
};

export default InfoText;
