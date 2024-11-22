'use client';

import { useEffect, useRef } from 'react';

type Point = {
    x: number;
    y: number;
};

type Size = {
    width: number;
    height: number;
};

type Rect = {
    position: Point; // координата центра прямоугольника
    size: Size;
};

type ConnectionPoint = {
    point: Point;
    angle: number; // угол в градусах
};

function CanvasComponentThird() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const OFFSET = 10; // Смещение для отступа линии от грани

    const getConnectedEdge = (rect: Rect, point: Point): string => {
        const left = rect.position.x - rect.size.width / 2;
        const right = rect.position.x + rect.size.width / 2;
        const top = rect.position.y - rect.size.height / 2;
        const bottom = rect.position.y + rect.size.height / 2;

        if (point.x === left) return 'left';
        if (point.x === right) return 'right';
        if (point.y === top) return 'top';
        if (point.y === bottom) return 'bottom';

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

            // console.log('ререндер')
            return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
        };

        const generateNeighbors = (point: Point): Point[] => {
            return [
                { x: point.x + 1, y: point.y },
                { x: point.x - 1, y: point.y },
                { x: point.x, y: point.y + 1 },
                { x: point.x, y: point.y - 1 },
            ];
        };

        const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        const openSet: Point[] = [start];
        const cameFrom = new Map<string, Point>();
        const gScore = new Map<string, number>();
        const fScore = new Map<string, number>();

        const pointKey = (point: Point) => `${point.x},${point.y}`;
        gScore.set(pointKey(start), 0);
        fScore.set(pointKey(start), heuristic(start, end));

        while (openSet.length > 0) {
            openSet.sort((a, b) => fScore.get(pointKey(a))! - fScore.get(pointKey(b))!);
            const current = openSet.shift()!;

            if (current.x === end.x && current.y === end.y) {
                const path: Point[] = [];
                let currentNode: Point | undefined = current;
                while (currentNode) {
                    path.unshift(currentNode);
                    currentNode = cameFrom.get(pointKey(currentNode));
                }
                return path;
            }

            for (const neighbor of generateNeighbors(current)) {
                if (obstacles.some((rect) => isInsideRect(neighbor, rect))) {
                    continue;
                }

                const tentativeGScore = gScore.get(pointKey(current))! + 1;

                if (tentativeGScore < (gScore.get(pointKey(neighbor)) ?? Infinity)) {
                    cameFrom.set(pointKey(neighbor), current);
                    gScore.set(pointKey(neighbor), tentativeGScore);
                    fScore.set(pointKey(neighbor), tentativeGScore + heuristic(neighbor, end));

                    if (!openSet.some((p) => p.x === neighbor.x && p.y === neighbor.y)) {
                        openSet.push(neighbor);
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
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const rect1: Rect = {
            position: { x: 150, y: 150 },
            size: { width: 100, height: 100 },
        };
        const rect2: Rect = {
            position: { x: 400, y: 300 },
            size: { width: 100, height: 100 },
        };

        // const cPoint1: ConnectionPoint = { point: { x: -20, y: -50 }, angle: -90 };
        const cPoint1: ConnectionPoint = { point: { x: 50, y: 0 }, angle: 0 }
        // const cPoint2: ConnectionPoint = { point: { x: 50, y: 0 }, angle: 0 };
        const cPoint2: ConnectionPoint = { point: { x: 0, y: 50 }, angle: 90 };

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
    }, []);

    return <canvas ref={canvasRef} width={1000} height={1000}></canvas>;
}

export default CanvasComponentThird;
