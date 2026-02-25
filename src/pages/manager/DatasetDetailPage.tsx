import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Tag } from 'antd';

// TODO: Replace with real API call
const mockDetail = {
  id: '67021a98-a0c5-4e67-9a8f-d9125a1f1***',
  name: 'Cityscape_Main_North',
  totalItems: 42800,
  labeled: 38200,
  storage: 'AWS S3',
  version: 2,
  createdAt: 'Dec 14, 2023 - 14:32:05 UTC',
  projectLink: '#',
  lastSync: '14 minutes ago',
  tags: ['object', 'layout', 'daytime'],
  items: [
    { name: 'north_main_img_0042.jpg', status: 'none', url: '', labeled: false },
    { name: 'north_main_img_0043.jpg', status: 'labeled', url: '', labeled: true },
    { name: 'north_main_img_0044.jpg', status: 'labeled', url: '', labeled: true },
    { name: 'north_main_img_0045.jpg', status: 'pending', url: '', labeled: false },
    { name: 'north_main_img_0046.jpg', status: 'labeled', url: '', labeled: true },
  ],
};

const DatasetDetailPage: React.FC = () => {
  const { id } = useParams();
  // TODO: fetch detail by id
  // Hiện tại mock, sau này sẽ fetch theo id
  const detail = { ...mockDetail, id, name: `Dataset_${id}` };

  return (
    <div className="flex flex-col w-full items-center min-h-screen bg-[#18122B] py-8">
      <div className="w-full max-w-[1400px]">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button shape="circle" size="large">←</Button>
          <h2 className="text-3xl font-bold text-white">Dataset: {detail.name}</h2>
        </div>
        {/* Stats */}
        <div className="flex gap-6 mb-8">
          <Card className="bg-[#231e31] text-white min-w-[200px]">
            <div className="text-xs text-gray-400">TOTAL ITEMS</div>
            <div className="text-2xl font-bold">{detail.totalItems.toLocaleString()}</div>
          </Card>
          <Card className="bg-[#231e31] text-white min-w-[200px]">
            <div className="text-xs text-gray-400">LABELED</div>
            <div className="text-2xl font-bold">{detail.labeled.toLocaleString()}</div>
          </Card>
          <Card className="bg-[#231e31] text-white min-w-[200px]">
            <div className="text-xs text-gray-400">STORAGE</div>
            <div className="text-2xl font-bold">{detail.storage}</div>
          </Card>
        </div>
        {/* Data Items Grid */}
        <div className="mb-8">
          <div className="text-lg text-white mb-2">Data Items</div>
          <div className="grid grid-cols-5 gap-4">
            {detail.items.map((item, idx) => (
              <Card key={idx} className="bg-[#231e31] text-white p-2">
                <div className="aspect-square bg-gray-900 mb-2 rounded-lg"></div>
                <div className="flex justify-between items-center">
                  <span>{item.name}</span>
                  {item.labeled && <Tag color="success">LABELED</Tag>}
                  {item.status === 'pending' && <Tag color="warning">PENDING</Tag>}
                </div>
                <Button type="link" className="mt-2 p-0">QUICK VIEW</Button>
              </Card>
            ))}
          </div>
        </div>
        {/* Metadata */}
        <div className="flex justify-end">
          <Card className="bg-[#231e31] text-white min-w-[320px]">
            <div className="mb-2 text-xs text-gray-400">DATASET ID</div>
            <div className="mb-2 text-white text-sm">{detail.id}</div>
            <div className="mb-2 text-xs text-gray-400">VERSION</div>
            <div className="mb-2 text-white text-sm">{detail.version}</div>
            <div className="mb-2 text-xs text-gray-400">STORAGE TYPE</div>
            <div className="mb-2 text-white text-sm">{detail.storage}</div>
            <div className="mb-2 text-xs text-gray-400">CREATED AT</div>
            <div className="mb-2 text-white text-sm">{detail.createdAt}</div>
            <div className="mb-2 text-xs text-gray-400">PROJECT LINK</div>
            <div className="mb-2 text-fuchsia-400 underline cursor-pointer">Autonomous Driving North A, B</div>
            <div className="mb-2 text-xs text-gray-400">LAST SYNCHRONIZED</div>
            <div className="mb-2 text-white text-sm">{detail.lastSync}</div>
            <div className="mb-2 text-xs text-gray-400">TAGS</div>
            <div className="mb-2">
              {detail.tags.map(tag => <Tag key={tag} color="purple" className="mr-1">{tag.toUpperCase()}</Tag>)}
            </div>
            <Button className="w-full mb-2 bg-fuchsia-600 text-white">SYNC NOW</Button>
            <Button className="w-full" danger>DELETE DATASET</Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DatasetDetailPage;
