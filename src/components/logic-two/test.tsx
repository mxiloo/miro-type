'use client';

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
    position: Point; 
    size: Size;
};

type Edge = 'top' | 'right' | 'bottom' | 'left';

interface Node {
    position: Point;
    g: number;
    h: number;
    f: number;
    parent?: Node;
}

function CanvasComponentAstar() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [startEdge, setStartEdge] = useState<Edge>('top');
    const [endEdge, setEndEdge] = useState<Edge>('right');

    const OFFSET = 10; // Смещение для соединительных линий от границ

    const getEdgePoint = (rect: Rect, edge: Edge): Point => {
        switch (edge) {
            case 'top':
                return { x: rect.position.x, y: rect.position.y - rect.size.height / 2 - OFFSET };
            case 'bottom':
                return { x: rect.position.x, y: rect.position.y + rect.size.height / 2 + OFFSET };
            case 'left':
                return { x: rect.position.x - rect.size.width / 2 - OFFSET, y: rect.position.y };
            case 'right':
                return { x: rect.position.x + rect.size.width / 2 + OFFSET, y: rect.position.y };
            default:
                return rect.position;
        }
    };

    const manhattanAStar = (start: Point, end: Point, rects: Rect[]): Point[] => {
        const heuristic = (a: Point, b: Point) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        const openSet: Node[] = [];
        const closedSet: Set<string> = new Set();

        openSet.push({
            position: start,
            g: 0,
            h: heuristic(start, end),
            f: heuristic(start, end),
            parent: undefined,
        });

        while (openSet.length > 0) {
            const current = openSet.sort((a, b) => a.f - b.f).shift()!;
            const currentKey = `${current.position.x},${current.position.y}`;

            if (current.position.x === end.x && current.position.y === end.y) {
                const path: Point[] = [];
                let node: Node | undefined = current;

                while (node) {
                    path.push(node.position);
                    node = node.parent;
                }

                return path.reverse();
            }

            closedSet.add(currentKey);

            const neighbors = [
                { x: current.position.x + 1, y: current.position.y },
                { x: current.position.x - 1, y: current.position.y },
                { x: current.position.x, y: current.position.y + 1 },
                { x: current.position.x, y: current.position.y - 1 },
            ];

            for (const neighbor of neighbors) {
                const neighborKey = `${neighbor.x},${neighbor.y}`;

                if (
                    closedSet.has(neighborKey) ||
                    isPointInsideRect({ x: neighbor.x, y: neighbor.y }, rects)
                ) {
                    continue;
                }

                const tentativeG = current.g + 1; // Всегда +1, так как двигаемся строго по осям
                const h = heuristic(neighbor, end);
                const f = tentativeG + h;

                const existing = openSet.find(n => n.position.x === neighbor.x && n.position.y === neighbor.y);
                if (!existing || tentativeG < existing.g) {
                    openSet.push({
                        position: neighbor,
                        g: tentativeG,
                        h,
                        f,
                        parent: current,
                    });
                }
            }
        }

        return [];
    };

    const isPointInsideRect = (point: Point, rects: Rect[]): boolean => {
        for (const rect of rects) {
            if (
                point.x >= rect.position.x - rect.size.width / 2 &&
                point.x <= rect.position.x + rect.size.width / 2 &&
                point.y >= rect.position.y - rect.size.height / 2 &&
                point.y <= rect.position.y + rect.size.height / 2
            ) {
                return true;
            }
        }
        return false;
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const rect1: Rect = {
            position: { x: 150, y: 150 },
            size: { width: 100, height: 100 },
        };
        const rect2: Rect = {
            position: { x: 450, y: 350 },
            size: { width: 100, height: 100 },
        };

        const start = getEdgePoint(rect1, startEdge);
        const end = getEdgePoint(rect2, endEdge);

        const path = manhattanAStar(start, end, [rect1, rect2]);
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        [rect1, rect2].forEach(rect => {
            ctx.fillStyle = "gray";
            ctx.fillRect(
                rect.position.x - rect.size.width / 2,
                rect.position.y - rect.size.height / 2,
                rect.size.width,
                rect.size.height
            );
        });

        if (path.length > 0) {
            ctx.beginPath();
            ctx.moveTo(path[0].x, path[0].y);
            for (let i = 1; i < path.length; i++) {
                ctx.lineTo(path[i].x, path[i].y);
            }
            ctx.strokeStyle = "black";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }, [startEdge, endEdge]);

    return (
        <div>
            <canvas ref={canvasRef} width={800} height={600}></canvas>
            <div>
                <h3>Выберите грани для соединения:</h3>
                <label>
                    Стартовая грань:
                    <select value={startEdge} onChange={(e) => setStartEdge(e.target.value as Edge)}>
                        <option value="top">Верхняя</option>
                        <option value="right">Правая</option>
                        <option value="bottom">Нижняя</option>
                        <option value="left">Левая</option>
                    </select>
                </label>
                <br />
                <label>
                    Конечная грань:
                    <select value={endEdge} onChange={(e) => setEndEdge(e.target.value as Edge)}>
                        <option value="top">Верхняя</option>
                        <option value="right">Правая</option>
                        <option value="bottom">Нижняя</option>
                        <option value="left">Левая</option>
                    </select>
                </label>
            </div>
        </div>
    );
}

export default CanvasComponentAstar;
