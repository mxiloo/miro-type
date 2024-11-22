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
    position: Point; // Координата центра прямоугольника
    size: Size;
};

type Edge = 'top' | 'right' | 'bottom' | 'left';

type ConnectionPoint = {
    point: Point;
    angle: number; // угол в градусах
};

function CanvasComponentAstar() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const [startEdge, setStartEdge] = useState<Edge>('top');
    const [endEdge, setEndEdge] = useState<Edge>('right');

    // Функция для получения координат точки на выбранной грани
    const getEdgePoint = (rect: Rect, edge: Edge): Point => {
        switch (edge) {
            case 'top':
                return { x: rect.position.x, y: rect.position.y - rect.size.height / 2 };
            case 'bottom':
                return { x: rect.position.x, y: rect.position.y + rect.size.height / 2 };
            case 'left':
                return { x: rect.position.x - rect.size.width / 2, y: rect.position.y };
            case 'right':
                return { x: rect.position.x + rect.size.width / 2, y: rect.position.y };
            default:
                return rect.position;
        }
    };

    // Алгоритм A* для поиска пути
    const aStar = (
        start: Point,
        end: Point,
        grid: number[][],
        cellSize: number
    ): Point[] | null => {
        const rows = grid.length;
        const cols = grid[0].length;

        const heuristic = (a: Point, b: Point) =>
            Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        const openSet: any[] = [];
        const closedSet: Set<string> = new Set();
        const cameFrom: { [key: string]: Point } = {};

        openSet.push({
            x: start.x,
            y: start.y,
            g: 0,
            h: heuristic(start, end),
            f: 0,
            parent: null,
        });

        const toKey = (point: Point) =>
            `${Math.floor(point.x / cellSize)},${Math.floor(point.y / cellSize)}`;

        while (openSet.length > 0) {
            const current = openSet.sort((a, b) => a.f - b.f).shift()!;
            const currentKey = toKey(current);

            if (
                Math.floor(current.x / cellSize) === Math.floor(end.x / cellSize) &&
                Math.floor(current.y / cellSize) === Math.floor(end.y / cellSize)
            ) {
                let path: Point[] = [];
                let node: Point | null = current;

                while (node) {
                    path.push({
                        x: node.x,
                        y: node.y,
                    });
                    node = cameFrom[toKey(node)];
                }

                return path.reverse();
            }

            closedSet.add(currentKey);

            const neighbors = [
                { x: current.x + cellSize, y: current.y },
                { x: current.x - cellSize, y: current.y },
                { x: current.x, y: current.y + cellSize },
                { x: current.x, y: current.y - cellSize },
            ];

            for (const neighbor of neighbors) {
                const neighborKey = toKey(neighbor);

                if (
                    neighbor.x < 0 ||
                    neighbor.x >= cols * cellSize ||
                    neighbor.y < 0 ||
                    neighbor.y >= rows * cellSize ||
                    grid[Math.floor(neighbor.y / cellSize)][Math.floor(neighbor.x / cellSize)] === 1 ||
                    closedSet.has(neighborKey)
                ) {
                    continue;
                }

                const tentativeG = current.g + 1;
                const existing = openSet.find(
                    n =>
                        Math.floor(n.x / cellSize) === Math.floor(neighbor.x / cellSize) &&
                        Math.floor(n.y / cellSize) === Math.floor(neighbor.y / cellSize)
                );

                if (!existing || tentativeG < existing.g) {
                    const h = heuristic(neighbor, end);
                    openSet.push({
                        ...neighbor,
                        g: tentativeG,
                        h,
                        f: tentativeG + h,
                        parent: current,
                    });
                    cameFrom[neighborKey] = current;
                }
            }
        }

        return null;
    };

    // Функция для генерации сетки
    const generateGrid = (width: number, height: number, cellSize: number): number[][] => {
        const rows = Math.ceil(height / cellSize);
        const cols = Math.ceil(width / cellSize);
        return Array.from({ length: rows }, () => Array(cols).fill(0));
    };

    // Функция для маркировки препятствий на сетке
    const markObstaclesOnGrid = (grid: number[][], rects: Rect[], cellSize: number) => {
        rects.forEach(rect => {
            const left = Math.floor((rect.position.x - rect.size.width / 2) / cellSize);
            const right = Math.ceil((rect.position.x + rect.size.width / 2) / cellSize);
            const top = Math.floor((rect.position.y - rect.size.height / 2) / cellSize);
            const bottom = Math.ceil((rect.position.y + rect.size.height / 2) / cellSize);

            for (let y = top; y < bottom; y++) {
                for (let x = left; x < right; x++) {
                    if (y >= 0 && y < grid.length && x >= 0 && x < grid[0].length) {
                        grid[y][x] = 1;
                    }
                }
            }
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const cellSize = 20;
        const grid = generateGrid(canvas.width, canvas.height, cellSize);

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

        markObstaclesOnGrid(grid, [rect1, rect2], cellSize);

        const path = aStar(start, end, grid, cellSize);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let y = 0; y < grid.length; y++) {
            for (let x = 0; x < grid[y].length; x++) {
                ctx.strokeStyle = grid[y][x] === 1 ? "inherit" : "lightgray";
                ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
            }
        }

        [rect1, rect2].forEach(rect => {
            ctx.fillStyle = "gray";
            ctx.fillRect(
                rect.position.x - rect.size.width / 2,
                rect.position.y - rect.size.height / 2,
                rect.size.width,
                rect.size.height
            );
        });

        if (path) {
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
