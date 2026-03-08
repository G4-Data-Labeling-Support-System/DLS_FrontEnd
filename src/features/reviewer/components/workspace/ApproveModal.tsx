import React from 'react'
import { Modal, Typography, Button } from 'antd'
import { CheckCircleOutlined } from '@ant-design/icons'

const { Text, Title } = Typography

interface ApproveModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: () => void
  confirmLoading?: boolean
}

export const ApproveModal: React.FC<ApproveModalProps> = ({
  open,
  onCancel,
  onConfirm,
  confirmLoading
}) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      width={400}
      closable={false}
      styles={{ mask: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 14, 23, 0.6)' } }}
    >
      <div className="p-6 text-center">
        <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-violet-500/20">
          <CheckCircleOutlined className="text-3xl text-violet-500" />
        </div>

        <Title level={4} className="!text-white !mb-2 font-display">
          Approve Review?
        </Title>
        <Text className="text-gray-300 block mb-8">
          Are you sure you want to mark this item as approved? This action cannot be easily undone.
        </Text>

        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onCancel}
            className="h-10 border-gray-700 bg-transparent text-gray-300 hover:text-white hover:border-gray-500 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            onClick={onConfirm}
            loading={confirmLoading}
            className="h-10 bg-violet-600 hover:bg-violet-500 border-none shadow-lg shadow-violet-900/20 rounded-xl"
          >
            Confirm Approve
          </Button>
        </div>
      </div>
    </Modal>
  )
}
