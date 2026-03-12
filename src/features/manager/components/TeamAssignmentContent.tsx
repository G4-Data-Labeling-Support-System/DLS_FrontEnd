import React, { useState, useMemo, useEffect } from 'react'
import { App, Input, Button, Avatar, Progress, Tag, Segmented, Spin, Form } from 'antd' // 1. Import Form
import {
  SearchOutlined,
  UserAddOutlined,
  CloseOutlined,
  StopOutlined,
  LoadingOutlined
} from '@ant-design/icons'
import { mainClient } from '@/api/ApiClients'
import { ENDPOINTS } from '@/api/endpoints'
import { FormFooter } from '@/features/manager/components/common/FormFooter'

interface UserUI {
  id: string | number
  name: string
  username: string
  role: string
  avatar: string
  email: string
  status: 'ACTIVE' | 'DEACTIVE' | string
  accuracy: number
  speed: number
}

interface TeamAssignmentContentProps {
  onLaunch?: (selectedTeam: UserUI[]) => void
  onBack?: () => void
}

export const TeamAssignmentContent: React.FC<TeamAssignmentContentProps> = ({
  onLaunch,
  onBack
}) => {
    const { message } = App.useApp()
    const [availableUsers, setAvailableUsers] = useState<UserUI[]>([])
    const [selectedUsers, setSelectedUsers] = useState<UserUI[]>([])
    const [loading, setLoading] = useState(true)
    const [isLaunching, setIsLaunching] = useState(false)
    const [filterRole, setFilterRole] = useState<string>('All')
    const [searchTerm, setSearchTerm] = useState('')

  // --- API CALL ---
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await mainClient.get(ENDPOINTS.USERS.LIST)
        // console.log("API User Response:", response);

        const rawList =
          response.data?.data || response.data?.content || response.data?.result || response.data

        if (!Array.isArray(rawList)) {
          // console.error("Data received is NOT an array:", rawList);
          setAvailableUsers([])
          return
        }

        const formattedData: UserUI[] = rawList.map((user: Record<string, unknown>) => ({
          id: user.id as string | number,
          name: (user.fullName as string) || (user.username as string) || 'Unknown User',
          username: (user.username as string) || `user_${user.id}`,
          role: (user.userRole as string) || 'Annotator',
          avatar:
            (user.coverImage as string) ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent((user.fullName as string) || 'User')}&background=random`,
          email: (user.email as string) || 'No email',
          status: (user.status as string) || 'ACTIVE',
          accuracy: Math.floor(Math.random() * (99 - 85) + 85),
          speed: Math.floor(Math.random() * (200 - 80) + 80)
        }))

        setAvailableUsers(formattedData)
      } catch {
        // console.error("❌ Error fetching users:", error);
        message.error('Failed to load workforce list.')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [message])

  // --- HANDLERS ---
  const handleAddUser = (user: UserUI) => {
    if (user.status !== 'ACTIVE') return message.warning('User is not active.')
    setSelectedUsers([...selectedUsers, user])
    setAvailableUsers(availableUsers.filter((u) => u.id !== user.id))
  }

  const handleRemoveUser = (user: UserUI) => {
    setAvailableUsers([...availableUsers, user])
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
  }

  // Hàm này sẽ được gọi khi Form submit (bấm nút Launch ở Footer)
  const handleFormFinish = async () => {
    if (!onLaunch) return
    setIsLaunching(true)

    // Giả lập delay xử lý
    await new Promise((resolve) => setTimeout(resolve, 500))

    onLaunch(selectedUsers)
    setIsLaunching(false)
  }

  const filteredAvailableUsers = useMemo(() => {
    return availableUsers.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole =
        filterRole === 'All' || user.role.toLowerCase().includes(filterRole.toLowerCase())
      return matchesSearch && matchesRole
    })
  }, [availableUsers, searchTerm, filterRole])

  const totalThroughput = selectedUsers.reduce((acc, curr) => acc + curr.speed, 0)
  const targetThroughput = 650
  const progressPercent = Math.min(Math.round((totalThroughput / targetThroughput) * 100), 100)

  return (
    // 2. Thay div bằng Form và gắn sự kiện onFinish
    <Form layout="vertical" className="flex flex-col gap-6" onFinish={handleFormFinish}>
      {/* GRID LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px] lg:h-[650px]">
        {/* --- CỘT TRÁI: AVAILABLE WORKFORCE --- */}
        <div className="flex flex-col h-full bg-[#1a1625]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-violet-400">groups</span>
              Available Workforce
            </h3>
            <Tag
              color="#8b5cf6"
              className="border-0 bg-violet-600/20 text-violet-300 font-bold px-3 rounded-full"
            >
              {filteredAvailableUsers.filter((u) => u.status === 'ACTIVE').length} Online
            </Tag>
          </div>

          <div className="space-y-4 mb-4">
            <Input
              prefix={<SearchOutlined className="text-gray-500" />}
              placeholder="Search by name, skill..."
              className="!bg-[#0f0e17]/50 !border-white/10 !text-white !rounded-xl !py-2.5 hover:!border-violet-500 focus:!border-violet-500"
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
            />
            <Segmented
              options={['All', 'Annotator', 'Reviewer']}
              value={filterRole}
              onChange={setFilterRole}
              className="!bg-[#0f0e17]/50 p-1 rounded-lg [&_.ant-segmented-item]:text-gray-400 [&_.ant-segmented-item-selected]:!bg-violet-600 [&_.ant-segmented-item-selected]:!text-white [&_.ant-segmented-item-selected]:!shadow-[0_2px_8px_rgba(124,58,237,0.4)] [&_.ant-segmented-item-hover]:!text-gray-200"
              block
              disabled={loading}
            />
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 z-10">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-3">
                <Spin
                  indicator={<LoadingOutlined style={{ fontSize: 32, color: '#8b5cf6' }} spin />}
                />
                <p className="text-xs">Loading workforce...</p>
              </div>
            ) : filteredAvailableUsers.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center text-gray-500 italic border border-dashed border-white/5 rounded-xl">
                <p>No available users found.</p>
              </div>
            ) : (
              filteredAvailableUsers.map((user) => (
                <div
                  key={user.id}
                  className={`bg-[#0f0e17]/40 border border-white/5 rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200 hover:border-violet-500/50 hover:bg-[#0f0e17]/60 group ${user.status !== 'ACTIVE' ? 'opacity-60 grayscale' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.avatar}
                      size={40}
                      className="border border-white/10 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-white font-bold text-sm truncate">{user.name}</h4>
                        {user.status !== 'ACTIVE' && (
                          <StopOutlined className="text-red-500 text-xs" />
                        )}
                      </div>
                      <div className="flex gap-2 items-center mt-0.5">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                            user.role.toLowerCase().includes('manager')
                              ? 'bg-red-500/20 text-red-400'
                              : user.role.toLowerCase().includes('annotator')
                                ? 'bg-orange-500/20 text-orange-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                          }`}
                        >
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="hidden xl:flex flex-col gap-1 w-16">
                      <Progress
                        percent={user.accuracy}
                        size={{ height: 4 }}
                        showInfo={false}
                        strokeColor="#a855f7"
                        railColor="rgba(255,255,255,0.1)"
                      />
                    </div>
                    <Button
                      type="primary"
                      size="small"
                      icon={<UserAddOutlined />}
                      className="bg-[#2d2b3b] border-0 text-gray-300 hover:!bg-violet-600 hover:!text-white aspect-square rounded-lg flex items-center justify-center shadow-none"
                      onClick={() => handleAddUser(user)}
                      disabled={user.status !== 'ACTIVE'}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* --- CỘT PHẢI: SELECTED TEAM --- */}
        <div className="flex flex-col h-full bg-[#1a1625]/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-white font-bold text-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-fuchsia-400">verified_user</span>
              Selected Team
            </h3>
            <span className="text-gray-400 text-xs">{selectedUsers.length} assigned</span>
          </div>

          <div className="bg-[#0f0e17]/60 border border-white/10 p-5 rounded-xl mb-4 relative overflow-hidden">
            <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-violet-500 to-fuchsia-500" />
            <div className="flex justify-between items-end mb-2">
              <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                Projected Throughput
              </span>
              <div className="text-right">
                <span className="text-2xl font-bold text-white tracking-tight">
                  {totalThroughput}
                </span>
                <span className="text-[10px] text-gray-500 ml-1 font-bold">TASKS / HR</span>
              </div>
            </div>
            <Progress
              percent={progressPercent}
              strokeColor={{ '0%': '#8b5cf6', '100%': '#d946ef' }}
              railColor="rgba(255,255,255,0.1)"
              size={{ height: 6 }}
              showInfo={false}
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-gray-500 z-10 mb-4 pr-2">
            {selectedUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 border-2 border-dashed border-white/5 rounded-xl bg-[#0f0e17]/20">
                <p>No team members assigned.</p>
                <span className="text-xs opacity-50">Select from available workforce</span>
              </div>
            ) : (
              selectedUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-[#0f0e17]/60 border-l-2 border-l-[#d946ef] border-y border-y-white/5 border-r border-r-white/5 rounded-xl px-4 py-3 flex items-center justify-between transition-all duration-200 group animate-[fadeInRight_0.2s_ease-out]"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={user.avatar} size={36} />
                    <div>
                      <p className="text-sm font-bold text-white leading-none">{user.name}</p>
                      <p className="text-[10px] text-gray-400 leading-none mt-1">{user.role}</p>
                    </div>
                  </div>
                  <Button
                    type="text"
                    size="small"
                    icon={<CloseOutlined />}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveUser(user)}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 3. Xóa prop onSubmit, FormFooter sẽ tự kích hoạt Form.onFinish */}
      <FormFooter
        currentStep={4}
        totalSteps={4}
        submitLabel="LAUNCH PROJECT"
        onBack={onBack}
        disabled={selectedUsers.length === 0}
        isLoading={isLaunching}
      />
    </Form>
  )
}
