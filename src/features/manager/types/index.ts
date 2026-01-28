export type ProjectDataType = 'image' | 'video' | 'text';

export interface CreateProjectFormValues {
    projectName: string;
    description?: string;
    deadline: any;
    dataType: ProjectDataType;
}