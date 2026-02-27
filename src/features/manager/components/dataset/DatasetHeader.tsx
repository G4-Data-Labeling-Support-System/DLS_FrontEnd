import React from 'react';
import { Breadcrumb } from 'antd';

interface DatasetHeaderProps {}

const DatasetHeader: React.FC<DatasetHeaderProps> = () => (
  <div className="w-full max-w-[1000px] mb-8">
    <Breadcrumb
      items={[{ title: 'Dashboard', href: '/manager' }, { title: 'Datasets' }]}
      className="mb-2 text-gray-400"
    />
    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500">
      Dataset Management
    </h1>
    <p className="text-gray-400 mt-2 text-lg font-light">
      View, create, and manage datasets for your projects
    </p>
  </div>
);

export default DatasetHeader;
