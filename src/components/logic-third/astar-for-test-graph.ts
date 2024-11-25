import { Point, Rect } from "../logic-astar/canvas-component-grid";

export const aStarGraph = (start: Point, end: Point, obstacles: Rect[]): Point[] => {
    const OFFSET = 10;
    const STEP = 10; // Шаг между соседними точками (можно менять при необходимости)

    const isInsideRect = (point: Point, rect: Rect): boolean => {
        const left = rect.position.x - rect.size.width / 2 - OFFSET;
        const right = rect.position.x + rect.size.width / 2 + OFFSET;
        const top = rect.position.y - rect.size.height / 2 - OFFSET;
        const bottom = rect.position.y + rect.size.height / 2 + OFFSET;

        return point.x >= left && point.x <= right && point.y >= top && point.y <= bottom;
    };

    const heuristic = (a: Point, b: Point): number =>
        Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

    const openSet = new Set<string>([`${start.x},${start.y}`]);
    const cameFrom = new Map<string, string>();
    const gScore = new Map<string, number>();
    const fScore = new Map<string, number>();

    const pointKey = (point: Point) => `${point.x},${point.y}`;
    gScore.set(pointKey(start), 0);
    fScore.set(pointKey(start), heuristic(start, end));

    while (openSet.size > 0) {
        const currentKey = Array.from(openSet).reduce((a, b) =>
            (fScore.get(a) ?? Infinity) < (fScore.get(b) ?? Infinity) ? a : b
        );

        openSet.delete(currentKey);
        const [currentX, currentY] = currentKey.split(',').map(Number);
        const current = { x: currentX, y: currentY };

        if (Math.abs(current.x - end.x) < STEP / 2 && Math.abs(current.y - end.y) < STEP / 2) {
            const path: Point[] = [];
            let currentPathKey = currentKey;
            while (currentPathKey) {
                const [x, y] = currentPathKey.split(',').map(Number);
                path.unshift({ x, y });
                currentPathKey = cameFrom.get(currentPathKey) as string;
            }
            return path;
        }

        const neighbors = [
            { x: current.x + STEP, y: current.y },
            { x: current.x - STEP, y: current.y },
            { x: current.x, y: current.y + STEP },
            { x: current.x, y: current.y - STEP },
        ];

        for (const neighbor of neighbors) {
            if (obstacles.some((rect) => isInsideRect(neighbor, rect))) continue;

            const neighborKey = pointKey(neighbor);
            const tentativeGScore = gScore.get(currentKey)! + 1;

            if (tentativeGScore < (gScore.get(neighborKey) ?? Infinity)) {
                cameFrom.set(neighborKey, currentKey);
                gScore.set(neighborKey, tentativeGScore);
                fScore.set(
                    neighborKey,
                    tentativeGScore + heuristic(neighbor, end)
                );

                if (!openSet.has(neighborKey)) {
                    openSet.add(neighborKey);
                }
            }
        }
    }

    return [];
};
