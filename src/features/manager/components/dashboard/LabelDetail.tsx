import React, { useEffect, useState } from 'react'
import { App, Spin, Typography, Card, Descriptions } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'
import labelApiClient from '@/api/LabelApi'
import datasetApi from '@/api/DatasetApi'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography

interface LabelDetailData {
  labelId?: string
  labelName?: string
  color?: string
  description?: string
  datasetId?: string
  createAt?: string
}

interface LabelDetailProps {
  labelId: string
  onBack: () => void
}

export const LabelDetail: React.FC<LabelDetailProps> = ({ labelId, onBack }) => {
  const { message } = App.useApp()
  const [label, setLabel] = useState<LabelDetailData | null>(null)
  const [datasetName, setDatasetName] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const navigate = useNavigate()

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setLoading(true)
        const response = await labelApiClient.getLabelById(labelId)
        const data = response.data?.data || response.data

        if (data && isMounted) {
          setLabel({
            labelId: String(data.labelId || data.id),
            labelName: String(data.labelName || data.name || ''),
            color: data.color ? String(data.color) : undefined,
            description: data.description ? String(data.description) : undefined,
            datasetId: data.datasetId ? String(data.datasetId) : undefined,
            createAt: data.createAt ? String(data.createAt) : undefined
          })

          if (data.datasetId) {
            try {
              const dsRes = await datasetApi.getDatasetById(data.datasetId)
              const dsData = dsRes.data?.data || dsRes.data
              if (dsData && isMounted) {
                setDatasetName(String(dsData.datasetName || dsData.name || data.datasetId))
              }
            } catch (dsErr) {
              console.error('Failed to fetch associated dataset details:', dsErr)
            }
          }
        }
      } catch (error) {
        if (isMounted) {
          console.error('Error fetching label details:', error)
          message.error('Cannot load label details.')
          onBack()
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (labelId) {
      fetchDetail()
    }

    return () => {
      isMounted = false
    }
  }, [labelId, onBack, message])

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  if (loading) {
    return (
      <div className="w-full h-64 flex justify-center items-center">
        <Spin size="large" />
      </div>
    )
  }

  if (!label) {
    return (
      <div className="w-full text-center py-10 text-gray-400">
        Error loading label information.
      </div>
    )
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          {label.color && (
            <div
              className="w-6 h-6 rounded-full border border-white/20"
              style={{ backgroundColor: label.color }}
            />
          )}
          <div>
            <Title level={3} className="!text-white !m-0 !font-display">
              {label.labelName || 'Unnamed Label'}
            </Title>
          </div>
        </div>
      </div>

      {/* Main Info Card */}
      <Card className="bg-[#1A1625] border-gray-800 rounded-xl mb-6 p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row h-full w-full">
          {/* Left: Label Information */}
          <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-gray-800">
            <Descriptions
              title={
                <span className="text-white text-lg font-display flex items-center gap-2">
                  <span className="material-symbols-outlined text-violet-400">info</span>
                  Label Information
                </span>
              }
              column={1}
              className="custom-descriptions"
              styles={{
                label: { color: '#9ca3af', fontWeight: 500, width: '150px' },
                content: { color: '#d1d5db' }
              }}
            >
              <Descriptions.Item label="Label ID">
                <span className="font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                  {label.labelId}
                </span>
              </Descriptions.Item>
              <Descriptions.Item label="Color">
                {label.color ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="w-5 h-5 rounded border border-white/20"
                      style={{ backgroundColor: label.color }}
                    />
                    <span className="font-mono text-sm">{label.color}</span>
                  </div>
                ) : (
                  <span className="text-gray-600 italic">N/A</span>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {formatDate(label.createAt)}
              </Descriptions.Item>
              <Descriptions.Item label="Associated Dataset">
                {label.datasetId ? (
                  <span
                    className="text-blue-400 hover:text-blue-300 cursor-pointer transition-colors"
                    onClick={() => navigate(`/manager/datasets?tab=label&labelId=${labelId}&datasetId=${label.datasetId}`)}
                  >
                    <DatabaseOutlined className="mr-1" />
                    {datasetName || `Dataset ID: ${label.datasetId}`}
                  </span>
                ) : (
                  <span className="text-gray-600 italic">No dataset associated</span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </div>

          {/* Right: Description */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-white text-lg font-display flex items-center gap-2">
                <span className="material-symbols-outlined text-green-400">description</span>
                Description
              </span>
            </div>
            <div className="flex-1 bg-[#231e31] p-4 rounded-xl border border-white/5">
              <div className="text-gray-400 text-sm whitespace-pre-wrap">
                {label.description || (
                  <span className="text-gray-600 italic">No description provided.</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        .custom-descriptions .ant-descriptions-title {
          margin-bottom: 20px;
        }
        .custom-descriptions .ant-descriptions-item-container {
          border-bottom: 1px solid #2d263b;
          padding-bottom: 12px;
          margin-bottom: 12px;
        }
        .custom-descriptions .ant-descriptions-item-container:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
      `}</style>
    </div>
  )
}
