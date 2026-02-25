import { Card, Button, Typography } from 'antd';
import { PlusCircleFilled, DownloadOutlined, FileTextOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { PATH_MANAGER } from '@/routes/paths';

const { Title } = Typography;

export const QuickActions = () => {
    const navigate = useNavigate();

    return (
        <Card className="h-full bg-[#1A1625] border-gray-800 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-6">
                <div className="text-violet-400 transform -rotate-12 bg-none text-xl">⚡</div>
                <Title level={5} className="!text-white !m-0 !font-normal !font-display">Quick Actions</Title>
            </div>

            <div className="flex flex-col gap-4">
                <Button
                    type="primary"
                    size="large"
                    className="w-full h-12 flex items-center justify-center bg-fuchsia-600 hover:bg-fuchsia-500 border-none shadow-[0_0_15px_rgba(192,38,211,0.4)]"
                    onClick={() => navigate(PATH_MANAGER.createProject)}
                >
                    <PlusCircleFilled className="text-lg mr-2" />
                    CREATE PROJECT
                </Button>

                <Button
                    className="w-full h-12 flex items-center justify-between bg-[#231e31] border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#2d2640]"
                >
                    <div className="flex items-center">
                        <DownloadOutlined className="mr-3 text-lg text-violet-400" />
                        <span>Export Data</span>
                    </div>
                    <RightOutlined className="text-xs" />
                </Button>

                <Button
                    className="w-full h-12 flex items-center justify-between bg-[#231e31] border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 hover:bg-[#2d2640]"
                    onClick={() => navigate(PATH_MANAGER.datasets)}
                >
                    <div className="flex items-center">
                        <FileTextOutlined className="mr-3 text-lg text-fuchsia-400" />
                        <span>DATASET LIST</span>
                    </div>
                    <RightOutlined className="text-xs" />
                </Button>
            </div>
        </Card>
    );
};
