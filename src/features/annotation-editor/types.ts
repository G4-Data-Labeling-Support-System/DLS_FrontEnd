export interface Shape {
  type: 'bounding_box' | 'polygon'
  x?: number
  y?: number
  width?: number
  height?: number
  startX?: number
  startY?: number
  points?: [number, number][]
  label: string
  color: string
  isPreview?: boolean
}

export interface Label {
  labelId: string
  labelName: string
  color: string
  description?: string
}

export interface DataItem {
  itemId: string
  fileName: string
  url: string
  fileFormat: string
  dataType: string
  dataItem?: {
    itemId?: string
    fileName?: string
    url?: string
    fileFormat?: string
    dataType?: string
  }
}
