import { Form, Switch } from "antd";

export default function SwitchInput({ checked, title, description, onChange, name, initialValue }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        <div className="text-[10px] text-[#7E8CA8]">{description}</div>
      </div>
      {name ? (
        <Form.Item name={name} valuePropName="checked" noStyle>
          <Switch className="bg-[#1E2633] [&.ant-switch-checked]:bg-[#10B981]" />
        </Form.Item>
      ) : (
        <Switch checked={checked} onChange={onChange} className="bg-[#1E2633] [&.ant-switch-checked]:bg-[#10B981]" />
      )}
    </div>
  );
}