import Header from "@/components/block/Header";
import TraceForm from "@/components/block/TraceForm";

export default function TracePage() {
  return (
    <div className="w-full">
      <Header headerText="個体検索" />
      <TraceForm />
      <div className="mb-5 text-center">
        <span>(c) 2019-2021 National Institute of Technology, </span>
        <span>Gifu College GIS Team</span>
      </div>
    </div>
  );
}
