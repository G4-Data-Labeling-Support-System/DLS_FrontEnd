import React, { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AllAssignments } from '@/features/manager/components/dashboard/AllAssignments'
import { AssignmentQuickActions } from '@/features/manager/components/dashboard/AssignmentQuickActions'
import { CreateAssignmentModal } from '@/features/manager/components/dashboard/CreateAssignmentModal'
import { type GetAssignmentsParams } from '@/api/AssignmentApi'
import { useInvalidateAssignments } from '@/features/manager/hooks/useProjectDetail'

const AssignmentManagementPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const invalidateAssignments = useInvalidateAssignments()
  
  const [createAssignmentOpen, setCreateAssignmentOpen] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState<GetAssignmentsParams | undefined>(undefined)

  const selectedAssignmentId = searchParams.get('assignmentId')
  
  const handleAssignmentSelect = (id: string | null) => {
    if (id) {
      setSearchParams({ assignmentId: id })
    } else {
      searchParams.delete('assignmentId')
      setSearchParams(searchParams)
    }
  }

  const handleCloseModal = () => {
    setCreateAssignmentOpen(false)
    setEditingAssignment(undefined)
  }

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 items-start relative">
        <div className={selectedAssignmentId ? 'xl:col-span-4' : 'xl:col-span-3'}>
          <AllAssignments
            selectedAssignmentId={selectedAssignmentId}
            onAssignmentSelect={handleAssignmentSelect}
            onEdit={(asn) => {
              setEditingAssignment(asn)
              setCreateAssignmentOpen(true)
            }}
          />
        </div>

        {!selectedAssignmentId && (
          <div className="xl:col-span-1 xl:sticky xl:top-6 space-y-6">
            <AssignmentQuickActions
              onCreateAssignment={() => {
                setEditingAssignment(undefined)
                setCreateAssignmentOpen(true)
              }}
            />
          </div>
        )}
      </div>

      <CreateAssignmentModal
        open={createAssignmentOpen}
        initialData={editingAssignment}
        onCancel={handleCloseModal}
        onSuccess={() => {
          handleCloseModal()
          invalidateAssignments()
        }}
      />
    </div>
  )
}

export default AssignmentManagementPage
