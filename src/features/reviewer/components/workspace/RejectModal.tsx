import React, { useState } from 'react'
import { Modal, Typography, Button, Input, Checkbox, Row, Col } from 'antd'
import { CloseCircleOutlined } from '@ant-design/icons'

const { Text } = Typography
const { TextArea } = Input

interface RejectModalProps {
  open: boolean
  onCancel: () => void
  onConfirm: (reason: string, feedback: string[]) => void
  annotations?: unknown[] // Allow passing annotations context if needed later
  confirmLoading?: boolean
}

const ERROR_TYPES = [
  'Incorrect Label',
  'Loose Bounding Box',
  'Missed Object',
  'Occlusion Not Marked',
  'Poor Image Quality'
]

export const RejectModal: React.FC<RejectModalProps> = ({
  open,
  onCancel,
  onConfirm,
  confirmLoading
}) => {
  const [reason, setReason] = useState('')
  const [feedback, setFeedback] = useState<string[]>([])

  const handleConfirm = () => {
    onConfirm(reason, feedback)
    // Reset state
    setReason('')
    setFeedback([])
  }

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      centered
      className="[&_.ant-modal-content]:!rounded-2xl [&_.ant-modal-content]:!shadow-2xl [&_.ant-modal-content]:!shadow-red-900/20 overflow-hidden"
      width={700}
      styles={{
        mask: { backdropFilter: 'blur(8px)', backgroundColor: 'rgba(15, 14, 23, 0.6)' }
      }}
      title={
        <div className="p-4 border-b border-violet-500/10 flex items-center gap-3 bg-white/5">
          <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center border border-red-500/20">
            <CloseCircleOutlined className="text-lg text-red-500" />
          </div>
          <span className="text-white font-display text-lg">Reject & Feedback</span>
        </div>
      }
    >
      <div className="p-6 space-y-6">
        {/* 1. Error Classification */}
        <div>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-3">
            Identify Issues
          </Text>
          <Checkbox.Group
            className="w-full"
            value={feedback}
            onChange={(vals) => setFeedback(vals as string[])}
          >
            <Row gutter={[12, 12]}>
              {ERROR_TYPES.map((type) => (
                <Col span={12} key={type}>
                  <div
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${feedback.includes(type) ? 'bg-red-500/10 border-red-500/50' : 'bg-[#231e31] border-gray-800 hover:border-gray-700'}`}
                  >
                    <Checkbox value={type} className="!text-gray-300 w-full pl-0">
                      {type}
                    </Checkbox>
                  </div>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>

        {/* 2. Detailed Comment */}
        <div>
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider block mb-3">
            Detailed Feedback
          </Text>
          <TextArea
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the issues found in this annotation..."
            className="!bg-[#0f0e17] !border-gray-700 !text-gray-300 placeholder:!text-gray-600 focus:!border-red-500/50 !rounded-xl"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
          <Button
            onClick={onCancel}
            className="h-10 border-gray-700 bg-transparent text-gray-300 hover:text-white hover:border-gray-500 rounded-xl px-6"
          >
            Cancel
          </Button>
          <Button
            type="primary"
            danger
            onClick={handleConfirm}
            disabled={!reason && feedback.length === 0}
            loading={confirmLoading}
            className="h-10 bg-red-600 hover:bg-red-500 border-none shadow-lg shadow-red-900/20 rounded-xl px-8"
          >
            Reject
          </Button>
        </div>
      </div>
    </Modal>
  )
}
