import { describe, it, expect } from '@jest/globals';
import { aStar } from './astar-for-test';

const OFFSET = 10;

type Point = { x: number; y: number };
type Size = { width: number; height: number };
type Rect = { position: Point; size: Size };

function getConnectedEdge(rect: Rect, point: Point): string {
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
}

function adjustPointWithOffset(rect: Rect, point: Point, edge: string): Point {
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
}

describe('Проверка на грани', () => {
    describe('getConnectedEdge', () => {
        const rect: Rect = { position: { x: 100, y: 100 }, size: { width: 50, height: 50 } };

        it('Грань', () => {
            expect(getConnectedEdge(rect, { x: 75, y: 100 })).toBe('left');
            expect(getConnectedEdge(rect, { x: 125, y: 100 })).toBe('right');
            expect(getConnectedEdge(rect, { x: 100, y: 75 })).toBe('top');
            expect(getConnectedEdge(rect, { x: 100, y: 125 })).toBe('bottom');
            expect(getConnectedEdge(rect, { x: 50, y: 50 })).toBe('none');
        });
    });

    describe('adjustPointWithOffset', () => {
        const rect: Rect = { position: { x: 100, y: 100 }, size: { width: 50, height: 50 } };

        it('Точка на грани', () => {
            expect(adjustPointWithOffset(rect, { x: 100, y: 75 }, 'top')).toEqual({ x: 100, y: 65 });
            expect(adjustPointWithOffset(rect, { x: 100, y: 125 }, 'bottom')).toEqual({ x: 100, y: 135 });
        });
    });
});


