import { useEffect, useState } from "react";
import { AdminPanelService } from "../../api";
import { useParams } from "react-router-dom";
import MainStudio from "./components/MainStudio";
import CountDownView from "./components/CountDownView";
import { SESSION_STATUS } from "../../core/constants";

const api = new AdminPanelService();

function AdminHostStudio() {
  const [detailData, setDetailData] = useState(null);
  const { _id } = useParams();

  const [loading, setLoading] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);

  const handleGetDetailLivestream = async () => {
    try {
      setLoading(true);

      const res = await api.actGetDetailLivestream(_id);

      const mainData = res.data.mainData;

      setDetailData(mainData);

      // waiting nếu chưa live
      setIsWaiting(mainData?.info?.status !== SESSION_STATUS.Live.value);
    } catch (error) {
      console.error("Failed to get detail livestream:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (_id) {
      handleGetDetailLivestream();
    }
  }, [_id]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#090D14] text-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#1E2633] border-t-[#D4AF37] rounded-full animate-spin"></div>

          <div className="text-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-[3px] mb-1">
              Đang tải studio
            </h3>

            <p className="text-[11px] text-[#7E8CA8] font-medium tracking-wide">
              Vui lòng chờ trong giây lát...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isWaiting) {
    return <CountDownView />;
  } else {
    return <MainStudio />;
  }

}

export default AdminHostStudio;