import { Point, Rect } from "./canvas-component-grid";

export const aStar = (start: Point, end: Point, obstacles: Rect[]): Point[] => {
    const isInsideRect = (point: Point, rect: Rect): boolean => {
        const left = rect.position.x - rect.size.width / 2 - 10;
        const right = rect.position.x + rect.size.width / 2 + 10;
        const top = rect.position.y - rect.size.height / 2 - 10;
        const bottom = rect.position.y + rect.size.height / 2 + 10;
        
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

        for (const step of [-10, 10]) {
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