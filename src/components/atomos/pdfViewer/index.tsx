import Link from "next/link";
import RoundButton from "../roundButton";
import { PDFViewerInterface } from "./interface";

const PDFViewer: React.FunctionComponent<PDFViewerInterface> = (props) => {
  return (
    <div className="fixed w-screen h-screen z-[999] top-0 left-0 flex flex-col">
      <div className="z-50 h-header w-full">
        <div className="shadow-5 relative z-10 h-header w-full bg-primary">
          <div className="flex h-full w-full items-center text-center text-2xl">
            <div className='w-full font-bold text-background'>{ props.title }</div>
          </div>
          <div
            className={
              'active:active-dark absolute right-3 top-2.5 box-content flex h-10 w-10 cursor-pointer items-center rounded-md border-x border-y border-solid border-background'
            }
            onClick={props.closeHandler}
          >
            <span className="hamburger-line rotate-45"></span>
            <span className="hamburger-line scale-0"></span>
            <span className="hamburger-line -rotate-45"></span>
          </div>
        </div>
      </div>
      <div className="grow bg-background">
        <iframe className="w-full h-full" allowFullScreen={true} src={`/static/pdfjs/web/viewer.html?file=${encodeURIComponent(props.url)}`} loading="lazy" />
      </div>
      <div className="z-50 h-footer w-full">
        <div className='shadow-5 flex h-footer w-full items-center justify-center overflow-hidden bg-background'>
          <div className='box-border w-3/4vw p-3vw text-center'>
            <Link href={props.url}>
              <a
                target='_blank'
                rel='noopener noreferrer'
              >
                <RoundButton color="primary">
                  別ウィンドウで開く
                </RoundButton>
              </a>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;