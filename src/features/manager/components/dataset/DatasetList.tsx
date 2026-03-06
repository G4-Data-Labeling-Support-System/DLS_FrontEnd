import { useNavigate, Link } from 'react-router-dom';
import { Spin, Empty, message, Modal } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import datasetApi, { type GetDatasetsParams } from '@/api/DatasetApi';
import { DatasetCard } from './DatasetCard';

interface DatasetListProps {
  datasets: GetDatasetsParams[];
  loading: boolean;
}


const DatasetList: React.FC<DatasetListProps> = ({ datasets, loading }) => {
  const navigate = useNavigate();

  const handleEdit = (id?: string) => {
    // Mock navigation
    if (id) navigate(`/manager/datasets/${id}`);
  };

  const handleDelete = (id?: string) => {
    if (!id) return;
    Modal.confirm({
      title: 'Delete Dataset',
      content: 'Are you sure you want to delete this dataset?',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      centered: true,
      onOk: async () => {
        try {
          await datasetApi.deleteDataset(id);
          message.success('Dataset deleted successfully!');
          // Here we could trigger a callback to re-fetch datasets from parent, but simplified for UI scope.
          window.location.reload();
        } catch {
          message.error('An error occurred while deleting the dataset.');
        }
      }
    });
  };

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="w-full">
      {datasets.length === 0 ? (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span className="text-gray-500">No datasets created yet.</span>}
          className="my-10 p-10 bg-[#1A1625]/40 rounded-xl border border-dashed border-gray-700"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch w-full">
          {datasets.map(ds => (
            <DatasetCard
              key={ds.datasetId}
              {...ds}
              onClick={() => handleEdit(ds.datasetId)}
              onEdit={() => handleEdit(ds.datasetId)}
              onDelete={() => handleDelete(ds.datasetId)}
            />
          ))}

          {/* Start New Dataset Card mapping */}
          <Link to="/manager/datasets/create" className="block group">
            <div className="h-full min-h-[160px] border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center gap-4 bg-[#1A1625]/30 hover:bg-[#1A1625] hover:border-violet-500 transition-all cursor-pointer">
              <div className="w-12 h-12 rounded-full bg-[#231e31] group-hover:bg-violet-600 flex items-center justify-center transition-colors">
                <PlusOutlined className="text-gray-400 group-hover:text-white text-xl" />
              </div>
              <span className="text-gray-400 group-hover:text-white font-medium font-display">Create Dataset</span>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default DatasetList;
