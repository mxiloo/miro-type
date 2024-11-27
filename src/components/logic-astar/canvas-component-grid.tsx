'use client';

import { useEffect, useRef, useState } from 'react';

export type Point = {
    x: number;
    y: number;
};

export type Size = {
    width: number;
    height: number;
};

export type Rect = {
    position: Point; // центр прямоугольника
    size: Size;
};

export type ConnectionPoint = {
    point: Point; // смещение относительно центра
    angle: number; // угол в градусах
};

function CanvasComponentGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [rect1Position, setRect1Position] = useState<'left' | 'right' | 'top' | 'bottom'>('top');
    const [rect2Position, setRect2Position] = useState<'left' | 'right' | 'top' | 'bottom'>('right');

    const OFFSET = 10; // Смещение для отступа линии от края

    const edgeConnectionPoints: Record<string, ConnectionPoint> = {
        left: { point: { x:-50, y: 0 }, angle: 180 },
        right: { point: { x: 50 , y: 0 }, angle: 0 },
        top: { point: { x: 0, y: -50 }, angle: -90 },
        bottom: { point: { x: 0, y: 50 }, angle: 90 },
    };

    const getConnectedEdge = (rect: Rect, point: Point): string => {
        const left = rect.position.x - rect.size.width / 2;
        const right = rect.position.x + rect.size.width / 2;
        const top = rect.position.y - rect.size.height / 2;
        const bottom = rect.position.y + rect.size.height / 2;

        const tolerance = 1;

        if (Math.abs(point.x - left) <= tolerance) return 'left';
        if (Math.abs(point.x - right) <= tolerance) return 'right';
        if (Math.abs(point.y - top) <= tolerance) return 'top';
        if (Math.abs(point.y - bottom) <= tolerance) return 'bottom';

        return 'none';
    };

    const adjustPointWithOffset = (rect: Rect, point: Point, edge: string): Point => {
        switch (edge) {
            case 'top':
                return { x: point.x, y: point.y - OFFSET };
            case 'bottom':
                return { x: point.x, y: point.y + OFFSET };
            case 'left':
                return { x: point.x - OFFSET, y: point.y };
            case 'right':
                return { x: point.x + OFFSET, y: point.y };
            default:
                return point;
        }
    };

    const aStar = (start: Point, end: Point, obstacles: Rect[]): Point[] => {
        const isInsideRect = (point: Point, rect: Rect): boolean => {
            const left = rect.position.x - rect.size.width / 2 - OFFSET;
            const right = rect.position.x + rect.size.width / 2 + OFFSET;
            const top = rect.position.y - rect.size.height / 2 - OFFSET;
            const bottom = rect.position.y + rect.size.height / 2 + OFFSET;
            
            console.log('ререндер')
            return point.x > left && point.x < right && point.y > top && point.y < bottom;
        };
    
        const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    
        const pointKey = (point: Point) => `${point.x},${point.y}`;
        const directionKey = (from: Point, to: Point): string => `${to.x - from.x},${to.y - from.y}`;
    
        const openSet: Set<string> = new Set([`${start.x},${start.y}`]);
        const cameFrom = new Map<string, string>();
        const directions = new Map<string, string>(); // Хранение направления пути
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();
    
        gScore.set(pointKey(start), 0);
        fScore.set(pointKey(start), heuristic(start, end));
    
        while (openSet.size > 0) {
            const currentKey = Array.from(openSet).reduce((a, b) =>
                (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
            );
    
            openSet.delete(currentKey);
            const [currentX, currentY] = currentKey.split(',').map(Number);
            const current = { x: currentX, y: currentY };
    
            if (Math.round(current.x) === Math.round(end.x) && Math.round(current.y) === Math.round(end.y)) {
                const path: Point[] = [];
                let currentPathKey = currentKey;
                while (currentPathKey) {
                    const [x, y] = currentPathKey.split(',').map(Number);
                    path.unshift({ x, y });
                    currentPathKey = cameFrom.get(currentPathKey) as string;
                }
                return path;
            }
    
            for (const step of [-OFFSET, OFFSET]) {
                const neighbors = [
                    { x: current.x + step, y: current.y },
                    { x: current.x, y: current.y + step },
                ];
    
                for (const neighbor of neighbors) {
                    if (obstacles.some((rect) => isInsideRect(neighbor, rect))) continue;
    
                    const neighborKey = pointKey(neighbor);
                    const tentativeGScore = gScore.get(currentKey)! + 1;
    
                    // Проверяем направление движения
                    const currentDirection = directions.get(currentKey);
                    const newDirection = directionKey(current, neighbor);
    
                    // Увеличиваем стоимость, если направление изменилось
                    const directionChangePenalty = currentDirection && currentDirection !== newDirection ? 10 : 0;
    
                    if (tentativeGScore + directionChangePenalty < (gScore.get(neighborKey) ?? Infinity)) {
                        cameFrom.set(neighborKey, currentKey);
                        gScore.set(neighborKey, tentativeGScore + directionChangePenalty);
                        fScore.set(
                            neighborKey,
                            tentativeGScore + directionChangePenalty + heuristic(neighbor, end)
                        );
                        directions.set(neighborKey, newDirection);
    
                        if (!openSet.has(neighborKey)) {
                            openSet.add(neighborKey);
                        }
                    }
                }
            }
        }
    
        return [];
    };
    

    const drawPath = (ctx: CanvasRenderingContext2D, path: Point[]) => {
        if (path.length < 2) return;

        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);

        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }

        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const drawLinesToAdjustedPoints = (
        ctx: CanvasRenderingContext2D,
        start: Point,
        adjustedStart: Point,
        end: Point,
        adjustedEnd: Point
    ) => {
        ctx.beginPath();

        ctx.moveTo(start.x, start.y);
        ctx.lineTo(adjustedStart.x, adjustedStart.y);

        ctx.moveTo(end.x, end.y);
        ctx.lineTo(adjustedEnd.x, adjustedEnd.y);

        ctx.strokeStyle = 'red';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    useEffect(() => {
        console.log('ререндер компонента')
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect1: Rect = { position: { x: 150, y: 150 }, size: { width: 100, height: 100 } };
        const rect2: Rect = { position: { x: 400, y: 300  }, size: { width: 100, height: 100 } };

        const cPoint1: ConnectionPoint = edgeConnectionPoints[rect1Position];
        const cPoint2: ConnectionPoint = edgeConnectionPoints[rect2Position];

        const start = {
            x: rect1.position.x + cPoint1.point.x,
            y: rect1.position.y + cPoint1.point.y,
        };

        const end = {
            x: rect2.position.x + cPoint2.point.x,
            y: rect2.position.y + cPoint2.point.y,
        };

        const adjustedStart = adjustPointWithOffset(rect1, start, getConnectedEdge(rect1, start));
        const adjustedEnd = adjustPointWithOffset(rect2, end, getConnectedEdge(rect2, end));

        const obstacles = [rect1, rect2];
        const path = aStar(adjustedStart, adjustedEnd, obstacles);

        ctx.fillStyle = 'gray';
        ctx.fillRect(
            rect1.position.x - rect1.size.width / 2,
            rect1.position.y - rect1.size.height / 2,
            rect1.size.width,
            rect1.size.height
        );
        ctx.fillRect(
            rect2.position.x - rect2.size.width / 2,
            rect2.position.y - rect2.size.height / 2,
            rect2.size.width,
            rect2.size.height
        );

        drawLinesToAdjustedPoints(ctx, start, adjustedStart, end, adjustedEnd);
        drawPath(ctx, path);
    }, [rect1Position, rect2Position, edgeConnectionPoints]);

    return (
        <>
            <div>
                <label>
                    Rect1 Position:
                    <select value={rect1Position} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRect1Position(e.target.value as 'left' | 'right' | 'top' | 'bottom')}>
                        {Object.keys(edgeConnectionPoints).map((key) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </label>
                <label>
                    Rect2 Position:
                    <select value={rect2Position} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setRect2Position(e.target.value as 'left' | 'right' | 'top' | 'bottom')}>
                        {Object.keys(edgeConnectionPoints).map((key) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ))}
                    </select>
                </label>
            </div>
            <canvas ref={canvasRef} width={1000} height={1000}></canvas>
        </>
    );
}

export default CanvasComponentGrid;
