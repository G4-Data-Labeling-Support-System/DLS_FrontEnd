import React from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

const DatasetHeader: React.FC = () => (
  <div className="w-full flex justify-between items-center mb-6">
    <Title level={4} className="!text-white !m-0 !font-display">All Datasets</Title>
  </div>
);

export default DatasetHeader;
