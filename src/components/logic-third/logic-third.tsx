'use client'

import { useEffect, useRef, useState } from "react";

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

    // const [edge, setEdge] = useState<any>({
    //     leftPosition: { x: -50, y: 0 }, leftAngle: 180, // left
    //     rightPosition: { x: 50, y: 0 }, rightAngle: 0, // right
    //     topPoint: { x: 0, y: -50 }, topAngle: -90, // top
    //     bottomPoint: { x: 0, y: 50 }, angle: 90 // bottom
    // })

    // console.log(edge.leftPosition)

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

    const dataConverter = (
        rect1: Rect,
        rect2: Rect,
        cPoint1: ConnectionPoint,
        cPoint2: ConnectionPoint
    ): Point[] => {
        const adjustPointWithOffset = (rect: Rect, point: Point, edge: string) => {
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

        const start = {
            x: rect1.position.x + cPoint1.point.x,
            y: rect1.position.y + cPoint1.point.y,
        };
        const end = {
            x: rect2.position.x + cPoint2.point.x,
            y: rect2.position.y + cPoint2.point.y,
        };

        const startEdge = getConnectedEdge(rect1, start);
        const endEdge = getConnectedEdge(rect2, end);

        // console.log(start);
        // console.log(`Начало: ${startEdge}`);
        // console.log(`Конец: ${endEdge}`);

        const adjustedStart = adjustPointWithOffset(rect1, start, startEdge);
        console.log(start)
        console.log(adjustedStart)
        const adjustedEnd = adjustPointWithOffset(rect2, end, endEdge);

        let path: Point[] = [adjustedStart];

        // Добавить автоматическое промежуточные точки для обхода фигур
        

        path.push(adjustedEnd);

        // Добавляем конечные точки на грани прямоугольников
        // Перпендикуляр граням
        path.push({
            x: end.x,
            y: end.y,
        });
        path.unshift({
            x: start.x,
            y: start.y,
        });

        return path;
    };

    const drawConnection = (ctx: CanvasRenderingContext2D, path: Point[]) => {
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        };
        ctx.strokeStyle = 'black';
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


        const cPoint1: ConnectionPoint = {
            point: { x: 0, y: -50 }, angle: -90
        };
        const cPoint2: ConnectionPoint = {
            point: { x: 50, y: 0 }, angle: 0
        };

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

        const path = dataConverter(rect1, rect2, cPoint1, cPoint2);
        drawConnection(ctx, path);
    }, []);

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600}></canvas>
        </div>
    );
}

export default CanvasComponentThird;
