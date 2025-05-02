"use client";

const AnnouncementBoard = () => {
  return (
    <>
      <div className="my-2 box-border rounded-2xl border-2 border-border px-3 py-2">
        <span className="font-bold">
          メンテナンスのお知らせ (2025/1/20追加)
        </span>
        <br />
        <span className="whitespace-pre-wrap">
          下記の日程で地図配信サーバーのメンテナンスが実施されます。
          期間中は入力データの巻き戻しなどが発生する可能性があるため、アクセスはお控えください。
          ◆作業日時 1月22日（水）午後8:00頃～翌日午前0:00頃
        </span>
      </div>
    </>
  );
};

export default AnnouncementBoard;
