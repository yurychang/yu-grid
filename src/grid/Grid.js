import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import {
    getAxisOffset,
    getItemContentSize,
    getPlacementOnAxis,
} from './helpers';

/**
 * Grid
 * @param {object} props
 * @param {number|string} props.rowHeight
 * - number: px
 * - string: ex. 25%, percentage of content-height, content-height = container-height - total-gap-space
 */
const Grid = ({
    width,
    height,
    rows,
    cols,
    gap = 12,
    rowHeight: _rowHeight,
    items: _items,
    children: _children,
    className,
}) => {
    const containerRef = useRef();

    const items = useMemo(
        () =>
            _items.map((item, i) => ({
                meta: {
                    originIndex: i,
                },
                show: false,
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                zIndex: 1,
                ...item,
            })),
        [_items]
    );

    const [gridItems, setGridItems] = useState(items);

    const [gridSize, setGridSize] = useState({
        colWidth: 0,
        rowHeight: _rowHeight,
    });

    useEffect(() => {
        function updateItemPlacement() {
            const containerEl = containerRef.current;

            const { width: containerWidth, height: containerHeight } =
                containerEl.getBoundingClientRect();

            const contentHeight = getItemContentSize(
                rows,
                containerHeight,
                gap
            );

            const colWidth =
                getItemContentSize(cols, containerWidth, gap) / cols;
            const rowHeight = isNaN(+_rowHeight)
                ? (parseFloat(_rowHeight) * contentHeight) / 100
                : _rowHeight;

            const newItems = items.map((item) => {
                const { row, col } = item;

                const [x, itemWidth] = getPlacementOnAxis(col, colWidth, gap);
                const [y, itemHeight] = getPlacementOnAxis(row, rowHeight, gap);

                return {
                    ...item,
                    show: true,
                    x,
                    y,
                    width: itemWidth,
                    height: itemHeight,
                };
            });

            setGridSize({ colWidth, rowHeight });
            setGridItems(newItems);
        }

        const resizeObserver = new ResizeObserver(updateItemPlacement);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_rowHeight, cols[0], cols[1], rows[0], rows[1], gap, items]);

    const dragStartEv = useRef();
    const dragItem = useRef();

    const dragStart = (id) => (e) => {
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
        dragStartEv.current = e;

        setGridItems((gridItems) => {
            let target;

            const newGridItems = gridItems
                .filter((item) => item.id !== 'temp')
                .map((item) => {
                    if (item.id === id) {
                        target = gridItems.find((item) => item.id === id);
                        dragItem.current = item;
                        return {
                            ...item,
                            zIndex: 9999,
                        };
                    }
                    return item;
                });

            const tempItem = createTempItem(target);

            return [...newGridItems, tempItem];
        });
    };

    const drag = (id) => (e) => {
        const movementX = e.pageX - dragStartEv.current.pageX;
        const movementY = e.pageY - dragStartEv.current.pageY;
        const target = dragItem.current;
        const targetX = target.x + movementX;
        const targetY = target.y + movementY;

        setGridItems((gridItems) =>
            gridItems.map((item) => {
                switch (item.id) {
                    case id:
                        return {
                            ...item,
                            x: targetX,
                            y: targetY,
                        };

                    case 'temp':
                        const [x, y] = calcFitPosition({
                            x: targetX + gridSize.colWidth / 2,
                            y: targetY + gridSize.rowHeight / 2,
                            ...gridSize,
                            gap,
                        });

                        return { ...item, x, y };

                    default:
                        return item;
                }
            })
        );
    };

    const dragOver = (e) => {
        e.preventDefault();
    };

    const drop = (e) => {
        e.preventDefault();
        const targetId = e.dataTransfer.getData('id');

        setGridItems((gridItems) =>
            gridItems
                .filter((item) => item.id !== 'temp')
                .map((item) => {
                    if (item.id === targetId) {
                        const [x, y] = calcFitPosition({
                            x: item.x + gridSize.colWidth / 2,
                            y: item.y + gridSize.rowHeight / 2,
                            ...gridSize,
                            gap,
                        });
                        return {
                            ...item,
                            x,
                            y,
                            zIndex: 1,
                        };
                    } else {
                        return {
                            ...item,
                            zIndex: 1,
                        };
                    }
                })
        );
    };

    const gridContent = gridItems.map(({ meta, ...item }) => (
        <GridItem
            key={item.id}
            {...item}
            draggable={true}
            onDragStart={dragStart(item.id)}
            onDrag={drag(item.id)}
        />
    ));

    return (
        <div
            ref={containerRef}
            onDragOver={dragOver}
            onDrop={drop}
            style={{ width, height }}
            className={classNames('relative overflow-hidden', className)}
        >
            {gridContent}
        </div>
    );
};

function createTempItem(source) {
    return {
        id: 'temp',
        show: true,
        x: source.x,
        y: source.y,
        width: source.width,
        height: source.height,
        zIndex: 9000,
        meta: {},
        children: (
            <div className="w-full h-full border-2 border-dashed border-gray-500"></div>
        ),
    };
}

function calcFitPosition({ x, y, colWidth, rowHeight, gap }) {
    let startCol = 1;
    while (x > startCol * (colWidth + gap) - gap / 2) {
        startCol += 1;
    }

    let startRow = 1;
    while (y > startRow * (rowHeight + gap) - gap / 2) {
        startRow += 1;
    }

    const xStartLine = startCol - 1;
    const yStartLine = startRow - 1;

    return [
        getAxisOffset(xStartLine, colWidth, gap),
        getAxisOffset(yStartLine, rowHeight, gap),
    ];
}

const GridItem = React.memo(
    ({
        id,
        show,
        row,
        col,
        width,
        height,
        x,
        y,
        zIndex,
        className,
        style = {},
        children,
        ...props
    }) => {
        return (
            <div
                data-yu-grid-id={id}
                className={classNames(
                    'absolute left-0 top-0',
                    { hidden: !show },
                    className
                )}
                style={{
                    width,
                    height,
                    transform: `translate(${x}px, ${y}px)`,
                    zIndex,
                    ...style,
                }}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Grid.Item = GridItem;

export default Grid;
