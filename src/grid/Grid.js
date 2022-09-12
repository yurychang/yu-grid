import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { getItemContentSize, getPlacementOnAxis } from './helpers';

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
    const prevDragEv = useRef();

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

            setGridItems(newItems);
        }

        const resizeObserver = new ResizeObserver(updateItemPlacement);
        resizeObserver.observe(containerRef.current);

        return () => resizeObserver.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_rowHeight, cols[0], cols[1], rows[0], rows[1], gap, items]);

    const dragStart = (id) => (e) => {
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setDragImage(document.createElement('div'), 0, 0);
        prevDragEv.current = e;

        setGridItems((gridItems) =>
            gridItems.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        zIndex: 9999,
                    };
                }
                return item;
            })
        );
    };

    const drag = (id) => (e) => {
        const movementX = e.pageX - prevDragEv.current.pageX;
        const movementY = e.pageY - prevDragEv.current.pageY;
        prevDragEv.current = e;

        setGridItems((gridItems) =>
            gridItems.map((item) => {
                if (item.id === id) {
                    return {
                        ...item,
                        x: item.x + movementX,
                        y: item.y + movementY,
                    };
                }
                return item;
            })
        );
    };

    const dragOver = (e) => {
        e.preventDefault();
    };

    const drop = (e) => {
        e.preventDefault();

        setGridItems((gridItems) =>
            gridItems.map((item) => ({
                ...item,
                zIndex: 1,
            }))
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
            className={classNames('relative', className)}
        >
            {gridContent}
        </div>
    );
};

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
