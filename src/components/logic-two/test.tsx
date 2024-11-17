'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
  selected: boolean;
  connectionPoints: { x: number, y: number }[];
}

interface Connection {
  start: { x: number, y: number };
  end: { x: number, y: number };
}

const initialRectA: Rect = { x: 50, y: 50, width: 100, height: 60, selected: false, connectionPoints: [] };
const initialRectB: Rect = { x: 250, y: 200, width: 100, height: 60, selected: false, connectionPoints: [] };
const SNAP_THRESHOLD = 20; // Расстояние притяжения
const PERPENDICULAR_OFFSET = 5; // Смещение перпендикуляра

const CanvasComponentTest: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rectA, setRectA] = useState(initialRectA);
  const [rectB, setRectB] = useState(initialRectB);
  const [dragging, setDragging] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number, y: number } | null>(null);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Вычисление точек подключения (середины сторон)
  const calculateConnectionPoints = useCallback((rect: Rect) => {
    const { x, y, width, height } = rect;
    return [
      { x: x + width / 2, y: y },               // Верхняя середина
      { x: x + width, y: y + height / 2 },      // Правая середина
      { x: x + width / 2, y: y + height },      // Нижняя середина
      { x: x, y: y + height / 2 }               // Левая середина
    ];
  }, []);

  // Инициализация точек подключения при монтировании компонента
  useEffect(() => {
    setRectA(prev => ({ ...prev, connectionPoints: calculateConnectionPoints(prev) }));
    setRectB(prev => ({ ...prev, connectionPoints: calculateConnectionPoints(prev) }));
  }, [calculateConnectionPoints]);

  // Функция рисования всех элементов на канвасе
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    [rectA, rectB].forEach(rect => {
      drawRect(ctx, rect);
      if (rect.selected) drawConnectionPoints(ctx, rect);
    });

    connections.forEach(connection => {
      drawOrthogonalArrow(ctx, connection.start, connection.end);
    });
  }, [rectA, rectB, connections]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Функция рисования прямоугольника
  const drawRect = (ctx: CanvasRenderingContext2D, rect: Rect) => {
    ctx.strokeStyle = rect.selected ? 'blue' : 'black';
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
  };

  // Функция рисования точек подключения
  const drawConnectionPoints = (ctx: CanvasRenderingContext2D, rect: Rect) => {
    ctx.fillStyle = 'red';
    rect.connectionPoints.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  // Функция рисования ортогональной линии (L-образной)
  const drawOrthogonalArrow = (
    ctx: CanvasRenderingContext2D,
    start: { x: number, y: number },
    end: { x: number, y: number }
  ) => {
    const path = calculateOrthogonalPath(start, end);
    if (path.length < 2) return;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < path.length; i++) {
      ctx.lineTo(path[i].x, path[i].y);
    }
    ctx.stroke();

    // Рисование стрелки в конце линии
    drawArrowhead(ctx, path[path.length - 1], path[path.length - 2]);
  };

  // Функция расчета ортогонального пути между двумя точками
  const calculateOrthogonalPath = (
    start: { x: number, y: number },
    end: { x: number, y: number }
  ): { x: number, y: number }[] => {
    const path: { x: number, y: number }[] = [];
  
    // Проверяем, можно ли нарисовать прямую линию
    if (start.x === end.x || start.y === end.y) {
      path.push(start, end);
    } else {
      // Добавляем L-образный путь
      if (Math.abs(start.x - end.x) < Math.abs(start.y - end.y)) {
        path.push(
          start,
          { x: start.x, y: end.y },
          { x: end.x + (start.x < end.x ? -PERPENDICULAR_OFFSET : PERPENDICULAR_OFFSET), y: end.y }
        );
      } else {
        path.push(
          start,
          { x: end.x, y: start.y },
          { x: end.x, y: end.y + (start.y < end.y ? -PERPENDICULAR_OFFSET : PERPENDICULAR_OFFSET) }
        );
      }
    }
    return path;
  };
  

  // Функция рисования стрелки (головки)
  const drawArrowhead = (
    ctx: CanvasRenderingContext2D,
    tip: { x: number, y: number },
    from: { x: number, y: number }
  ) => {
    const angle = Math.atan2(tip.y - from.y, tip.x - from.x);
    const headLength = 10; // Длина стрелки
    const arrowAngle = Math.PI / 6; // Угол стрелки

    ctx.beginPath();
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(
      tip.x - headLength * Math.cos(angle - arrowAngle),
      tip.y - headLength * Math.sin(angle - arrowAngle)
    );
    ctx.moveTo(tip.x, tip.y);
    ctx.lineTo(
      tip.x - headLength * Math.cos(angle + arrowAngle),
      tip.y - headLength * Math.sin(angle + arrowAngle)
    );
    ctx.stroke();
  };

  // Функция притягивания точки к границе прямоугольника
  const snapToEdge = (x: number, y: number, rect: Rect) => {
    let snappedX = x;
    let snappedY = y;
    let isSnapped = false;

    if (Math.abs(x - rect.x) <= SNAP_THRESHOLD) {
      snappedX = rect.x;
      isSnapped = true;
    } else if (Math.abs(x - (rect.x + rect.width)) <= SNAP_THRESHOLD) {
      snappedX = rect.x + rect.width;
      isSnapped = true;
    }

    if (Math.abs(y - rect.y) <= SNAP_THRESHOLD) {
      snappedY = rect.y;
      isSnapped = true;
    } else if (Math.abs(y - (rect.y + rect.height)) <= SNAP_THRESHOLD) {
      snappedY = rect.y + rect.height;
      isSnapped = true;
    }

    return { x: snappedX, y: snappedY, isSnapped };
  };

  // Функция применения перпендикулярного смещения
  const applyPerpendicularOffset = (
    start: { x: number, y: number },
    end: { x: number, y: number }
  ) => {
    let offsetX = 0;
    let offsetY = 0;

    if (end.x === start.x) {
      // Вертикальная линия
      offsetY = end.y > start.y ? -PERPENDICULAR_OFFSET : PERPENDICULAR_OFFSET;
    } else if (end.y === start.y) {
      // Горизонтальная линия
      offsetX = end.x > start.x ? -PERPENDICULAR_OFFSET : PERPENDICULAR_OFFSET;
    }

    return { x: end.x + offsetX, y: end.y + offsetY };
  };

  // Обработчик события нажатия мыши
  const handleMouseDown = (event: React.MouseEvent) => {
    const { offsetX, offsetY } = event.nativeEvent;
    const rect = [rectA, rectB].find(r => isInsideRect(r, offsetX, offsetY));

    if (rect) {
      setRectA(prev => ({ ...prev, selected: r => r === rect ? true : false }));
      setRectB(prev => ({ ...prev, selected: r => r === rect ? true : false }));
      const connectionPoint = rect.connectionPoints.find(pt => isNearPoint(pt, offsetX, offsetY)) || null;
      if (connectionPoint) {
        setStartPoint(connectionPoint);
        setDragging(true);
      }
    }
  };

  // Обработчик события перемещения мыши
  const handleMouseMove = (event: React.MouseEvent) => {
    if (dragging && startPoint) {
      let { offsetX, offsetY } = event.nativeEvent;

      // Проверка на притяжение к границе другого прямоугольника
      const rect = [rectA, rectB].find(r => r !== getRectByPoint(startPoint) && (isInsideRect(r, offsetX, offsetY) || isNearRect(r, offsetX, offsetY)));
      if (rect) {
        const snappedPoint = snapToEdge(offsetX, offsetY, rect);
        if (snappedPoint.isSnapped) {
          offsetX = snappedPoint.x;
          offsetY = snappedPoint.y;
        }
      }

      // Временное соединение
      draw();
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx && startPoint) {
        const adjustedEnd = applyPerpendicularOffset(startPoint, { x: offsetX, y: offsetY });
        drawOrthogonalArrow(ctx, startPoint, adjustedEnd);
      }
    }
  };

  // Обработчик события отпускания мыши
  const handleMouseUp = (event: React.MouseEvent) => {
    if (dragging && startPoint) {
      let { offsetX, offsetY } = event.nativeEvent;

      // Проверка на притяжение к границе другого прямоугольника
      const rect = [rectA, rectB].find(r => r !== getRectByPoint(startPoint) && (isInsideRect(r, offsetX, offsetY) || isNearRect(r, offsetX, offsetY)));
      if (rect) {
        const snappedPoint = snapToEdge(offsetX, offsetY, rect);
        offsetX = snappedPoint.x;
        offsetY = snappedPoint.y;
      }

      const endPoint = { x: offsetX, y: offsetY };
      const adjustedEndPoint = applyPerpendicularOffset(startPoint, endPoint);
      setConnections(prevConnections => [...prevConnections, { start: startPoint, end: adjustedEndPoint }]);
    }

    setDragging(false);
    setStartPoint(null);
    draw();
  };

  // Проверка, находится ли точка внутри прямоугольника
  const isInsideRect = (rect: Rect, x: number, y: number) => {
    return x > rect.x && x < rect.x + rect.width && y > rect.y && y < rect.y + rect.height;
  };

  // Проверка, находится ли точка рядом с прямоугольником
  const isNearRect = (rect: Rect, x: number, y: number) => {
    return (
      (x >= rect.x - SNAP_THRESHOLD && x <= rect.x + rect.width + SNAP_THRESHOLD) &&
      (y >= rect.y - SNAP_THRESHOLD && y <= rect.y + rect.height + SNAP_THRESHOLD)
    );
  };

  // Проверка, близка ли точка к точке подключения
  const isNearPoint = (pt: { x: number, y: number }, x: number, y: number) => {
    const distance = Math.sqrt((x - pt.x) ** 2 + (y - pt.y) ** 2);
    return distance < 10;
  };

  // Получение прямоугольника по точке подключения
  const getRectByPoint = (point: { x: number, y: number }): Rect | null => {
    if (rectA.connectionPoints.some(pt => pt.x === point.x && pt.y === point.y)) {
      return rectA;
    }
    if (rectB.connectionPoints.some(pt => pt.x === point.x && pt.y === point.y)) {
      return rectB;
    }
    return null;
  };

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={400}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: '1px solid black' }}
    />
  );
};

export default CanvasComponentTest;
