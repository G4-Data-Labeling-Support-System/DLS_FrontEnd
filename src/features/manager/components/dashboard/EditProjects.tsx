import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { App, Form, Input, Select, Button, Spin, Typography, Card, Space } from 'antd'
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons'
import projectApi from '@/api/ProjectApi'
import { PATH_MANAGER } from '@/routes/paths'

const { Title } = Typography
const { TextArea } = Input

export const EditProject = () => {
  const { message } = App.useApp()
  // Lấy id từ URL (ví dụ: /manager/projects/edit/:id)
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [form] = Form.useForm()

  const [loading, setLoading] = useState<boolean>(true)
  const [submitting, setSubmitting] = useState<boolean>(false)

  // 1. Lấy dữ liệu chi tiết của dự án khi component mount
  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!id) return
      try {
        setLoading(true)
        const response = await projectApi.getProjectById(id)
        // Điều chỉnh theo cấu trúc thực tế của response backend
        const projectData = response.data?.data || response.data

        if (projectData) {
          // Đổ dữ liệu vào Form
          form.setFieldsValue({
            projectName: projectData.projectName || projectData.name,
            description: projectData.description,
            projectStatus: projectData.projectStatus || 'ACTIVE'
          })
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin dự án:', error)
        message.error('Không thể tải dữ liệu dự án. Vui lòng thử lại.')
        // Nếu lỗi, có thể đá người dùng về trang danh sách
        navigate(PATH_MANAGER.root || '/manager')
      } finally {
        setLoading(false)
      }
    }

    fetchProjectDetail()
  }, [id, form, navigate])

  // 2. Xử lý khi submit Form thành công
  const onFinish = async (values: any) => {
    if (!id) return
    try {
      setSubmitting(true)
      // Gọi API updateProject mà bạn đã định nghĩa trong project.ts
      await projectApi.updateProject(id, values)

      message.success('Cập nhật dự án thành công!')
      // Quay về trang danh sách dự án
      navigate(-1) // Hoặc navigate(PATH_MANAGER.root)
    } catch (error) {
      console.error('Lỗi khi cập nhật dự án:', error)
      message.error('Cập nhật thất bại. Vui lòng kiểm tra lại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex flex-col justify-center items-center">
        <Spin size="large" />
        <div className="mt-4 text-gray-400">Đang tải thông tin dự án...</div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto pb-10">
      {/* Header / Nút Back */}
      <Space
        className="mb-6 cursor-pointer text-gray-400 hover:text-white transition-colors"
        onClick={() => navigate(-1)}
      >
        <ArrowLeftOutlined />
        <span>Quay lại</span>
      </Space>

      <Title level={3} className="!text-white !mb-6 !font-display">
        Chỉnh sửa Dự án
      </Title>

      {/* Form Card */}
      <Card className="bg-[#1A1625] border-gray-800 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={false} // Ẩn dấu sao đỏ mặc định của Antd để tự custom UI nếu muốn
        >
          <Form.Item
            label={<span className="text-gray-300 font-medium">Tên dự án</span>}
            name="projectName"
            rules={[{ required: true, message: 'Vui lòng nhập tên dự án!' }]}
          >
            <Input
              size="large"
              placeholder="Nhập tên dự án..."
              className="bg-[#231e31] border-gray-700 text-white placeholder:text-gray-500 hover:border-violet-500 focus:border-violet-500 focus:shadow-none"
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300 font-medium">Trạng thái</span>}
            name="projectStatus"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select
              size="large"
              className="w-full custom-dark-select"
              options={[
                { value: 'ACTIVE', label: 'Hoạt động (Active)' },
                { value: 'PAUSED', label: 'Tạm dừng (Paused)' },
                { value: 'COMPLETED', label: 'Hoàn thành (Completed)' }
              ]}
            />
          </Form.Item>

          <Form.Item
            label={<span className="text-gray-300 font-medium">Mô tả</span>}
            name="description"
          >
            <TextArea
              rows={4}
              placeholder="Nhập mô tả chi tiết cho dự án..."
              className="bg-[#231e31] border-gray-700 text-white placeholder:text-gray-500 hover:border-violet-500 focus:border-violet-500 focus:shadow-none"
            />
          </Form.Item>

          {/* Nút hành động */}
          <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-800">
            <Button
              size="large"
              className="bg-transparent border-gray-600 text-gray-300 hover:text-white hover:border-gray-400"
              onClick={() => navigate(-1)}
            >
              Hủy bỏ
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={submitting}
              className="bg-violet-600 hover:bg-violet-500 border-none px-8"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>

      {/* Thêm CSS inline để xử lý nền tối cho Select Dropdown của Antd nếu cần */}
      <style>{`
                .ant-select-selector {
                    background-color: #231e31 !important;
                    border-color: #374151 !important;
                    color: white !important;
                }
                .ant-select-arrow {
                    color: #9ca3af !important;
                }
            `}</style>
    </div>
  )
}
