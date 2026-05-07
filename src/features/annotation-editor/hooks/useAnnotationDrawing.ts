import { useState, useCallback } from 'react'
import type { Shape } from '../types'



export function useAnnotationDrawing() {
  const [tool, setTool] = useState<'pan' | 'box' | 'polygon'>('pan')
  const [shapes, setShapes] = useState<Shape[]>([])
  const [currentShape, setCurrentShape] = useState<Shape | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [redoStack, setRedoStack] = useState<Shape[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const handleUndo = useCallback(() => {
    if (shapes.length === 0) return
    const lastShape = shapes[shapes.length - 1]
    setShapes(prev => prev.slice(0, -1))
    setRedoStack(prev => [...prev, lastShape])
    setIsDirty(true)
  }, [shapes])

  const handleRedo = useCallback(() => {
    if (redoStack.length === 0) return
    const shapeToRestore = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))
    setShapes(prev => [...prev, shapeToRestore])
    setIsDirty(true)
  }, [redoStack])

  const handleRemoveShape = useCallback((index: number) => {
    setShapes(prev => prev.filter((_, i) => i !== index))
    setIsDirty(true)
  }, [])

  const resetDrawing = useCallback((newShapes: Shape[] = []) => {
    setShapes(newShapes)
    setCurrentShape(null)
    setIsDrawing(false)
    setRedoStack([])
    setIsDirty(false)
  }, [])

  const addShape = useCallback((shape: Shape) => {
    setShapes(prev => [...prev, shape])
    setRedoStack([])
    setIsDirty(true)
  }, [])

  return {
    tool,
    setTool,
    shapes,
    setShapes,
    currentShape,
    setCurrentShape,
    isDrawing,
    setIsDrawing,
    redoStack,
    isDirty,
    setIsDirty,
    handleUndo,
    handleRedo,
    handleRemoveShape,
    resetDrawing,
    addShape
  }
}
