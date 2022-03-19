import { TraceDataProps } from './interface';

const TraceData: React.FunctionComponent<TraceDataProps> = ({ data_key, value, isBottom }) => {
  return (
    <ul
      className={'m-0 table w-full p-0' + (isBottom ? ' border-b border-solid border-b-text' : '')}
    >
      <li className='box-border table-cell w-[130px] border-l border-r border-t border-solid border-text py-2 pr-1 pl-2 text-left font-bold'>
        {data_key}
      </li>
      <li className='box-border table-cell justify-center border-r border-t border-solid border-text pl-2 align-middle'>
        {value}
      </li>
    </ul>
  );
};

export default TraceData;
