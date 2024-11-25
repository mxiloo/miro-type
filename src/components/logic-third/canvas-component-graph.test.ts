import { Point, Rect } from "../logic-astar/canvas-component-grid";
import { aStarGraph } from "./astar-for-test-graph";


const isInsideRect = (point: Point, rect: Rect): boolean => {
    const OFFSET = 10;
    const left = rect.position.x - rect.size.width / 2 - OFFSET;
    const right = rect.position.x + rect.size.width / 2 + OFFSET;
    const top = rect.position.y - rect.size.height / 2 - OFFSET;
    const bottom = rect.position.y + rect.size.height / 2 + OFFSET;

    return point.x > left && point.x < right && point.y > top && point.y < bottom;
};

describe('isInsideRect', () => {
    it('should return true if point is inside the rectangle including offset', () => {
        const point: Point = { x: 15, y: 15 };
        const rect: Rect = { position: { x: 10, y: 10 }, size: { width: 10, height: 10 } };

        expect(isInsideRect(point, rect)).toBe(true);
    });

    it('should return false if point is outside the rectangle including offset', () => {
        const point: Point = { x: 30, y: 30 };
        const rect: Rect = { position: { x: 10, y: 10 }, size: { width: 10, height: 10 } };

        expect(isInsideRect(point, rect)).toBe(false);
    });
});

// describe('aStarGraph', () => {
//     it('should return a direct path when there are no obstacles', () => {
//         const start: Point = { x: 0, y: 0 };
//         const end: Point = { x: 20, y: 0 };
//         const obstacles: Rect[] = [];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([
//             { x: 0, y: 0 },
//             { x: 10, y: 0 },
//             { x: 20, y: 0 },
//         ]);
//     });

//     it('should avoid obstacles and find an alternate path', () => {
//         const start: Point = { x: 0, y: 0 };
//         const end: Point = { x: 20, y: 0 };
//         const obstacles: Rect[] = [
//             { position: { x: 10, y: 0 }, size: { width: 10, height: 10 } },
//         ];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([
//             { x: 0, y: 0 },
//             { x: 0, y: 10 },
//             { x: 10, y: 10 },
//             { x: 20, y: 10 },
//             { x: 20, y: 0 },
//         ]);
//     });

//     it('should handle cases where the start point is inside an obstacle', () => {
//         const start: Point = { x: 10, y: 0 };
//         const end: Point = { x: 20, y: 0 };
//         const obstacles: Rect[] = [
//             { position: { x: 10, y: 0 }, size: { width: 10, height: 10 } },
//         ];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([]); // No valid path exists
//     });

//     it('should find a path with minimal turns', () => {
//         const start: Point = { x: 0, y: 0 };
//         const end: Point = { x: 30, y: 0 };
//         const obstacles: Rect[] = [
//             { position: { x: 10, y: 0 }, size: { width: 10, height: 10 } },
//             { position: { x: 20, y: 10 }, size: { width: 10, height: 10 } },
//         ];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([
//             { x: 0, y: 0 },
//             { x: 0, y: 10 },
//             { x: 10, y: 10 },
//             { x: 10, y: 20 },
//             { x: 20, y: 20 },
//             { x: 30, y: 20 },
//             { x: 30, y: 10 },
//             { x: 30, y: 0 },
//         ]);
//     });

//     it('should return an empty path if no path exists', () => {
//         const start: Point = { x: 0, y: 0 };
//         const end: Point = { x: 20, y: 0 };
//         const obstacles: Rect[] = [
//             { position: { x: 10, y: 0 }, size: { width: 30, height: 10 } },
//         ];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([]); // No valid path exists
//     });

//     it('should handle floating-point coordinates correctly', () => {
//         const start: Point = { x: 0.5, y: 0.5 };
//         const end: Point = { x: 20.5, y: 0.5 };
//         const obstacles: Rect[] = [
//             { position: { x: 10.5, y: 0.5 }, size: { width: 5, height: 5 } },
//         ];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([
//             { x: 0.5, y: 0.5 },
//             { x: 5.5, y: 0.5 },
//             { x: 5.5, y: 5.5 },
//             { x: 15.5, y: 5.5 },
//             { x: 20.5, y: 5.5 },
//             { x: 20.5, y: 0.5 },
//         ]);
//     });

//     it('should return an empty path if start and end points are the same', () => {
//         const start: Point = { x: 0, y: 0 };
//         const end: Point = { x: 0, y: 0 };
//         const obstacles: Rect[] = [];

//         const result = aStarGraph(start, end, obstacles);

//         expect(result).toEqual([{ x: 0, y: 0 }]);
//     });
// });
