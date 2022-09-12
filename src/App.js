import Grid from './grid';
import el from './el';
import { useMemo } from 'react';

const Card = el.div`w-full h-full bg-slate-700`;

function App() {
    const items = useMemo(
        () => [
            {
                id: 'a',
                row: [1, 2],
                col: [0, 1],
                children: <Card />,
            },
            {
                id: 'b',
                row: [0, 2],
                col: [1, 2],
                children: <Card />,
            },
        ],
        []
    );

    return (
        <div>
            <Grid
                rows={5}
                cols={5}
                items={items}
                rowHeight="20%"
                className="w-screen h-screen"
            />
        </div>
    );
}

export default App;
