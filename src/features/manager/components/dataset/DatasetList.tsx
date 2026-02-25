import React from 'react';
import { Button } from 'antd';
import { type Dataset } from '@/api/dataset';

interface DatasetListProps {
  datasets: Dataset[];
  loading: boolean;
}

const DatasetList: React.FC<DatasetListProps> = ({ datasets, loading }) => (
  <div className="w-full max-w-[1000px] bg-white/5 rounded-xl shadow p-6 flex flex-col gap-4">
    {loading ? (
      <div className="text-center text-gray-400">Loading...</div>
    ) : datasets.length === 0 ? (
      <div className="text-center text-gray-400">No datasets found.</div>
    ) : (
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="py-2">Name</th>
            <th className="py-2">Version</th>
            <th className="py-2">Storage</th>
            <th className="py-2">Items</th>
            <th className="py-2">Created</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map(ds => (
            <tr key={ds.id} className="border-b border-gray-800 hover:bg-violet-950/20 transition">
              <td className="py-2 font-semibold">{ds.name}</td>
              <td className="py-2">v{ds.version}</td>
              <td className="py-2">{ds.storageType}</td>
              <td className="py-2">{ds.itemCount}</td>
              <td className="py-2">{ds.createdAt}</td>
              <td className="py-2">
                <Button size="small" type="link">View</Button>
                <Button size="small" type="link">Edit</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </div>
);

export default DatasetList;
