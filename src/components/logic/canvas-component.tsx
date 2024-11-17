'use client'

import React, { useRef, useEffect, useState } from 'react';

type Point = {
  x: number;
  y: number;
};

type Size = {
  width: number;
  height: number;
};

type Rect = {
  position: Point;
  size: Size;
};

type ConnectionPoint = {
  point: Point;
  angle: number; // угол в градусах
};

// Функция для получения границ прямоугольника
const getRectangleEdges = (rect: Rect) => {
  const { position, size } = rect;
  return {
    left: position.x - size.width / 2,
    right: position.x + size.width / 2,
    top: position.y - size.height / 2,
    bottom: position.y + size.height / 2
  };
};

const RectangleConnection: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rect1, setRect1] = useState<Rect>({
    position: { x: 200, y: 200 },
    size: { width: 150, height: 100 }
  });
  const [rect2, setRect2] = useState<Rect>({
    position: { x: 400, y: 300 },
    size: { width: 150, height: 100 }
  });
  const [mousePosition, setMousePosition] = useState<Point | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas?.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = 'black';

        // Отрисовываем два прямоугольника
        const rect1Edges = getRectangleEdges(rect1);
        const rect2Edges = getRectangleEdges(rect2);
        ctx.strokeRect(rect1Edges.left, rect1Edges.top, rect1.size.width, rect1.size.height);
        ctx.strokeRect(rect2Edges.left, rect2Edges.top, rect2.size.width, rect2.size.height);

        // Отображаем координаты на грани, если курсор находится на границе прямоугольника
        if (mousePosition && hoveredEdge) {
          ctx.fillStyle = 'blue';
          ctx.font = '12px Arial';
          ctx.fillText(
            `(${mousePosition.x}, ${mousePosition.y})`,
            mousePosition.x + 10,
            mousePosition.y + 10
          );
        }
      }
    }
  }, [rect1, rect2, mousePosition, hoveredEdge]);

  // Обработчик движения мыши
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rect1Edges = getRectangleEdges(rect1);
      const rect2Edges = getRectangleEdges(rect2);

      // Проверка, находится ли курсор рядом с гранями прямоугольника
      const edgeThreshold = 5; // Допустимое расстояние до грани

      // Проверяем для rect1
      if (Math.abs(x - rect1Edges.left) <= edgeThreshold && y >= rect1Edges.top && y <= rect1Edges.bottom) {
        setHoveredEdge('rect1 left');
        setMousePosition({ x, y });
      } else if (Math.abs(x - rect1Edges.right) <= edgeThreshold && y >= rect1Edges.top && y <= rect1Edges.bottom) {
        setHoveredEdge('rect1 right');
        setMousePosition({ x, y });
      } else if (Math.abs(y - rect1Edges.top) <= edgeThreshold && x >= rect1Edges.left && x <= rect1Edges.right) {
        setHoveredEdge('rect1 top');
        setMousePosition({ x, y });
      } else if (Math.abs(y - rect1Edges.bottom) <= edgeThreshold && x >= rect1Edges.left && x <= rect1Edges.right) {
        setHoveredEdge('rect1 bottom');
        setMousePosition({ x, y });
      }
      // Проверяем для rect2
      else if (Math.abs(x - rect2Edges.left) <= edgeThreshold && y >= rect2Edges.top && y <= rect2Edges.bottom) {
        setHoveredEdge('rect2 left');
        setMousePosition({ x, y });
      } else if (Math.abs(x - rect2Edges.right) <= edgeThreshold && y >= rect2Edges.top && y <= rect2Edges.bottom) {
        setHoveredEdge('rect2 right');
        setMousePosition({ x, y });
      } else if (Math.abs(y - rect2Edges.top) <= edgeThreshold && x >= rect2Edges.left && x <= rect2Edges.right) {
        setHoveredEdge('rect2 top');
        setMousePosition({ x, y });
      } else if (Math.abs(y - rect2Edges.bottom) <= edgeThreshold && x >= rect2Edges.left && x <= rect2Edges.right) {
        setHoveredEdge('rect2 bottom');
        setMousePosition({ x, y });
      } else {
        setHoveredEdge(null);
        setMousePosition(null);
      }
    }
  };

  // Обработчик выхода мыши за пределы canvas
  const handleMouseLeave = () => {
    setMousePosition(null);
    setHoveredEdge(null);
  };

  return (
    <div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      ></canvas>
    </div>
  );
};

export default RectangleConnection;