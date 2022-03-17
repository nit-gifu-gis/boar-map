const Footer: React.FunctionComponent = (props) => {
  let children;

  if (Array.isArray(props.children)) {
    const width = `${100 / props.children.length}vw`;
    children = [];
    props.children.forEach((child, index) => {
      children.push(
        <div
          className='box-border p-3vw text-center'
          key={`footer-${index}`}
          style={{ width: width }}
        >
          {child}
        </div>,
      );
    });
  } else {
    // 子要素が1つ
    children = <div className='box-border w-3/4vw p-3vw text-center'>{props.children}</div>;
  }

  return (
    <div className='shadow-5 flex h-footer w-full items-center justify-center overflow-hidden bg-background'>
      {children}
    </div>
  );
};

export default Footer;
