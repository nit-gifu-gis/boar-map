"use client";
import Footer from "@/app/map/_footer";
import Header from "@/app/map/_header";
import Button from "@/components/ui/Button";
import { useFormDataParser } from "@/utils/formData";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function MapPage() {
  const [isLoading] = useState(true);
  const formParser = useFormDataParser();
  const router = useRouter();

  const onClickAdd = () => {
    formParser.updateData(null);
    router.push("/add");
  };

  const Map = useMemo(
    () =>
      dynamic(() => import("./_map"), {
        loading: () => <p>A map is loading</p>,
        ssr: false,
      }),
    [],
  );

  return (
    <>
      <div className="flex h-screen flex-col">
        <Header>マップ</Header>
        <div className="flex-grow overflow-hidden">
          <Map />
          <div className="pointer-events-none absolute top-header z-10 w-full">
            <div className="mx-auto flex h-full w-[220px] flex-col-reverse"></div>
          </div>
          <div
            className={`shadow-3 loading-center absolute z-20 rounded ${isLoading ? "block" : "hidden"}`}
          >
            <Image
              src="/images/map/loading.gif"
              alt="Loading icon"
              width={33}
              height={33}
            />
          </div>
        </div>
        <div className="h-footer"></div>
        <div className="fixed bottom-0 w-full">
          <Footer>
            <Button color="primary" onClick={onClickAdd}>
              新規情報登録
            </Button>
          </Footer>
        </div>
      </div>
    </>
  );
}
