const InfoTitle: React.FunctionComponent = (props) => {
  return (
    <div className='my-[10px] w-full text-justify text-lg font-bold text-text'>
      <div>{props.children}</div>
    </div>
  );
};

export default InfoTitle;
