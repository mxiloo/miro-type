# MIRO-TYPE
## Построения пути от граней фигур
___
Ознакомиться с проектом можно по ссылке: https://mxiloo.github.io/miro-type/
___
В проекте есть 2 компонента с двумя разными логиками. Суть у них одна - поиск и построение самого короткого пути из начальной точки к конечной.
Для создания такой логики поведения был использован алгоритм aStar (A*). Верхний (первый) компонент использует сетку, как в классическом алгоритме, а второй - графы. 

Чего я хотел добиться? Хотелось добиться максимальной универсальности, чтобы фигуры и точки могли находиться в любом месте canvas и чтобы они не ограничивались конкретно ячейками сетки.
___

### Использование A* с графами
![image](https://github.com/user-attachments/assets/164db006-54a7-4985-a5c1-fc4e2cf668c8)
___

### Использование A* с сеткой

![image](https://github.com/user-attachments/assets/5e22600d-9141-49e4-bb56-b08898fdb013)
___

### Как выбрать любую из граней:
* Левая грань: { point: { x: -50, y: 0 }, angle: 180 }
* Правая грань: { point: { x: 50, y: 0 }, angle: 0 }
* Верхняя грань: { point: { x: 0, y: -50 }, angle: -90 }
* Нижняя грань: { point: { x: 0, y: 50 }, angle: 90 }

```bash
const rect1: Rect = { position: { x: 150, y: 150 }, size: { width: 100, height: 100 } };
const rect2: Rect = { position: { x: 400, y: 300 }, size: { width: 100, height: 100 } };

const cPoint1: ConnectionPoint = { point: { x: -50, y: -30 }, angle: 180 }
const cPoint2: ConnectionPoint = { point: { x: 0, y: 50 }, angle: 90 };
```

Что нужно доделать и подправить:
1. В логике с графами пока что не получилось добиться того, чтобы линия использовала минимальное количество поворотов. Однако путь простроится всегда из любой точки.
2. В логике с сеткой удалось добиться нужного поведения построения линии, однако остается проблема: не все пути получается посчитать.
