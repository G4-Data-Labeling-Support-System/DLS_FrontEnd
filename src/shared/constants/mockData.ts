/**
 * Centralized Mock Data for Development and Fallback
 */

export const MOCK_TEST_TASK = {
    id: 'test-task-1',
    name: 'TEST_SCAN_001.png',
    taskStatus: 'PENDING',
    annotationStatus: 'not_submitted',
    batchLabel: 'Test Batch',
    timeTaken: '--'
}

export const MOCK_DASHBOARD_DATA = {
    assignment: {
        id: 'ASGN-MOCK-001',
        name: 'Image Classification - Batch A',
        status: 'IN_PROGRESS',
        description:
            'Please classify the following medical images based on the provided guidelines. Pay attention to edge clarity.',
        projectId: 'PROJ-MOCK-012',
        completedTasks: 12,
        totalTasks: 50,
        tasks: [
            {
                id: '1',
                name: 'X-RAY_001.jpg',
                taskStatus: 'COMPLETED',
                annotationStatus: 'submitted',
                batchLabel: 'Batch 1',
                timeTaken: '2m 15s'
            },
            {
                id: '2',
                name: 'X-RAY_002.jpg',
                taskStatus: 'COMPLETED',
                annotationStatus: 'submitted',
                batchLabel: 'Batch 1',
                timeTaken: '1m 45s'
            },
            {
                id: '3',
                name: 'X-RAY_003.jpg',
                taskStatus: 'IN_PROGRESS',
                annotationStatus: 'needs_editing',
                batchLabel: 'Batch 1',
                timeTaken: '0m 30s'
            },
            {
                id: '4',
                name: 'MRI_SCAN_A1.png',
                taskStatus: 'PENDING',
                annotationStatus: 'not_submitted',
                batchLabel: 'Batch 2',
                timeTaken: '--'
            },
            {
                id: '5',
                name: 'MRI_SCAN_A2.png',
                taskStatus: 'PENDING',
                annotationStatus: 'not_submitted',
                batchLabel: 'Batch 2',
                timeTaken: '--'
            },
            MOCK_TEST_TASK
        ]
    },
    project: {
        id: 'PROJ-MOCK-012',
        name: 'Medical Imaging Diagnosis AI',
        status: 'ACTIVE',
        description:
            'A large-scale project to label X-ray and MRI scans for training a diagnostic AI model.'
    },
    guideline: {
        id: 'GUIDE-001',
        content: `### Labeling Guidelines
1. **Identify Organs**: Locate the primary organ in the image.
2. **Quality Check**: Ensure the image is not blurry.
3. **Anomalies**: Flag any visible fractures or tumors.
4. **Consistency**: Use the standard coordinate system provided in the tools.`,
        status: 'ACTIVE'
    }
}

export const MOCK_ANNOTATION_ITEMS = [
    {
        id: 'item-1',
        filename: 'medical_scan_01.png',
        url: 'https://picsum.photos/seed/scan1/800/600',
        dataType: 'Image',
        geometry: {
            type: 'polygon',
            coordinates: [
                [10, 20],
                [30, 40],
                [50, 60]
            ]
        }
    },
    {
        id: 'item-2',
        filename: 'medical_scan_02.png',
        url: 'https://picsum.photos/seed/scan2/800/600',
        dataType: 'Image',
        geometry: {
            type: 'bounding_box',
            x: 100,
            y: 150,
            width: 200,
            height: 180
        }
    },
    {
        id: 'item-3',
        filename: 'medical_scan_03.png',
        url: 'https://picsum.photos/seed/scan3/800/600',
        dataType: 'Image',
        geometry: {
            type: 'point',
            x: 450,
            y: 320
        }
    }
]

export const MOCK_AVAILABLE_LABELS = [
    { name: 'Car', color: '#8b5cf6' },
    { name: 'People', color: '#f43f5e' },
    { name: 'Tree', color: '#10b981' },
    { name: 'Sign', color: '#f59e0b' },
    { name: 'Building', color: '#3b82f6' },
    { name: 'Road', color: '#6366f1' }
]

export const MOCK_DATASET_DETAIL = {
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
    items: []
}

export const MOCK_TASK_DETAIL = {
    id: 'TASK-UUID-001',
    assignmentId: 'ASGN-UUID-123',
    taskType: 'classification',
    completedCount: 5,
    flagForReview: false,
    reviewStatus: 'not_reviewed',
    status: 'completed',
    createdAt: '2024-03-07T10:00:00Z',
    dataItems: [
        {
            id: 'item-1',
            filename: 'medical_scan_01.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: '2024-03-07T09:00:00Z',
            previewUrl: 'https://picsum.photos/seed/scan1/100/100'
        },
        {
            id: 'item-2',
            filename: 'medical_scan_02.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: '2024-03-07T09:05:00Z',
            previewUrl: 'https://picsum.photos/seed/scan2/100/100'
        },
        {
            id: 'item-3',
            filename: 'medical_scan_03.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: '2024-03-07T09:10:00Z',
            previewUrl: 'https://picsum.photos/seed/scan3/100/100'
        }
    ]
}

export const MOCK_TEST_ANNOTATION_ITEMS = [
    {
        id: 'test-item-1',
        filename: 'TEST_SCAN_001.png',
        url: 'https://picsum.photos/seed/test1/800/600',
        dataType: 'Image',
        geometry: {
            type: 'bounding_box',
            x: 50,
            y: 50,
            width: 100,
            height: 100
        }
    }
]

export const MOCK_TEST_TASK_DETAIL = {
    id: 'test-task-1',
    assignmentId: 'ASGN-MOCK-001',
    taskType: 'classification',
    completedCount: 0,
    flagForReview: false,
    reviewStatus: 'not_reviewed',
    status: 'pending',
    createdAt: new Date().toISOString(),
    dataItems: [
        {
            id: 'test-item-1',
            filename: 'TEST_SCAN_001.png',
            fileFormat: 'PNG',
            dataType: 'Image',
            uploadedAt: new Date().toISOString(),
            previewUrl: 'https://picsum.photos/seed/test1/100/100'
        }
    ]
}
