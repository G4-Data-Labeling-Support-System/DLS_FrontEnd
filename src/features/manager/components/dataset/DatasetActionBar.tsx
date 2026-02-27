import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const DatasetActionBar: React.FC = () => (
  <div className="w-full max-w-[1000px] flex justify-end mb-6">
    <Button type="primary" icon={<PlusOutlined />} href="/manager/create-dataset">
      New Dataset
    </Button>
  </div>
);

export default DatasetActionBar;
