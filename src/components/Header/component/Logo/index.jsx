import { useNavigate } from "react-router-dom";
import images from "../../../../config/images";

export default function ({ handleCloseDrawer }) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center">
      <button
        type="button"
        href="/"
        className="flex items-center gap-2 md:gap-3 no-underline uppercase tracking-widest font-extrabold"
        onClick={() => {
          navigate('/');
          handleCloseDrawer?.();
        }}
      >
        <img
          src={images.logoXHeroLive}
          alt="XHERO"
          className="size-14 md:size-10 md:size-[60px] object-contain shrink-0"
        />

        <div className="flex flex-col items-start">
          <span className="text-3xl md:text-xl font-bold md:text-3xl bg-gradient-to-br from-[#bf953f] via-[#fcf6ba] to-[#aa771c] bg-clip-text text-transparent">
            XHERO
          </span>

          <span className="hidden md:block text-xs leading-3 font-light tracking-wider capitalize text-[var(--text-secondary)] -mt-1 whitespace-nowrap">
            Livestream Admin Panel
          </span>
        </div>
      </button>
    </div>
  );
}