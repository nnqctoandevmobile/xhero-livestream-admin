import IconMonitor from "../icons/IconMonitor";
import IconUsers from "../icons/IconUsers";
import IconVideo from "../icons/IconVideo";

export const SCENES = [
  {
    id: 'focus',
    name: 'Focus Cam',
    icon: <IconVideo className="w-5 h-5" />,
    desc: 'Chỉ hiển thị camera Chuyên gia'
  },
  {
    id: 'presentation',
    name: 'Presentation',
    icon: <IconMonitor className="w-5 h-5" />,
    desc: 'Tài liệu + Cam host góc nhỏ'
  },
  {
    id: 'dual',
    name: 'Dual Cam',
    icon: <IconUsers className="w-5 h-5" />,
    desc: 'Chuyên gia & Viewer tương tác'
  },
];
