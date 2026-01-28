import { Radio } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import React from 'react';

interface DataTypeCardProps {
    value: string;
    icon: React.ReactNode;
    title: string;
    desc: string;
}

export const DataTypeCard: React.FC<DataTypeCardProps> = ({ value, icon, title, desc }) => (
    <Radio.Button value={value} className="h-auto p-0 border-none bg-transparent flex-1 group">
        <div className="relative p-6 rounded-xl border border-[#9d27f1]/30 bg-[#1a1625] transition-all flex flex-col items-center text-center gap-3 group-[.ant-radio-button-wrapper-checked]:border-[#9d27f1] group-[.ant-radio-button-wrapper-checked]:bg-[#9d27f1]/10">
            <div className="size-14 rounded-full flex items-center justify-center text-2xl transition-all bg-[#1a1625] border border-[#9d27f1]/30 text-[#ad9cba] group-[.ant-radio-button-wrapper-checked]:bg-[#9d27f1] group-[.ant-radio-button-wrapper-checked]:text-white group-[.ant-radio-button-wrapper-checked]:shadow-[0_0_15px_rgba(157,39,241,0.5)]">
                {icon}
            </div>
            <div>
                <div className="text-white font-bold text-lg group-[.ant-radio-button-wrapper-checked]:text-[#9d27f1]">{title}</div>
                <div className="text-xs text-[#ad9cba] mt-1">{desc}</div>
            </div>
            <div className="absolute top-3 right-3 opacity-0 group-[.ant-radio-button-wrapper-checked]:opacity-100 transition-opacity">
                <CheckCircleFilled className="text-[#9d27f1] text-lg" />
            </div>
        </div>
    </Radio.Button>
);