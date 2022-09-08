import React, { useEffect, useRef, useState } from 'react';
import classNames from 'classnames';

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

    const [items, setItems] = useState(
        _items.map((item) => ({
            show: false,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            ...item,
        }))
    );

    // useEffect(() => {
    //     function updateItemPlacement() {
    //         const containerEl = containerRef.current;

    //         const { width: containerWidth, height: containerHeight } =
    //             containerEl.getBoundingClientRect();

    //         const contentHeight = getItemContentSize(
    //             rows,
    //             containerHeight,
    //             gap
    //         );

    //         const colWidth =
    //             getItemContentSize(cols, containerWidth, gap) / cols;
    //         const rowHeight = isNaN(+_rowHeight)
    //             ? (parseFloat(_rowHeight) * contentHeight) / 100
    //             : _rowHeight;

    //         const placement = {};

    //         React.Children.forEach(_children, function ({ props }) {
    //             const { id, row, col } = props;

    //             const [x, itemWidth] = getPlacementOnAxis(col, colWidth, gap);
    //             const [y, itemHeight] = getPlacementOnAxis(row, rowHeight, gap);

    //             placement[id] = {
    //                 x,
    //                 width: itemWidth,
    //                 y,
    //                 height: itemHeight,
    //             };
    //         });
    //     }

    //     const resizeObserver = new ResizeObserver(updateItemPlacement);
    //     resizeObserver.observe(containerRef.current);

    //     return () => resizeObserver.disconnect();
    // }, [_rowHeight, _children, cols, gap, rows]);

    const gridContent = items.map((item) => (
        <GridItem key={item.id} {...item} />
    ));

    return (
        <div
            ref={containerRef}
            style={{ width, height }}
            className={classNames('relative', className)}
        >
            {gridContent}
        </div>
    );
};

const GridItem = ({
    id,
    show,
    row,
    col,
    width,
    height,
    x,
    y,
    className,
    children,
}) => {
    return (
        <div
            className={classNames(
                'absolute left-0 top-0',
                { hidden: !show },
                className
            )}
            style={{ width, height, transform: `translate(${x}px, ${y}px)` }}
        >
            {children}
        </div>
    );
};

Grid.Item = GridItem;

export default Grid;
