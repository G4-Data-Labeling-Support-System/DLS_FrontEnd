export interface CreateProjectInput {
    projectName: string;
    description?: string;
    deadline: string;
    dataType: 'image' | 'video' | 'text';
}

export interface ProjectIdState {
    id: string;
    locked: boolean;
}