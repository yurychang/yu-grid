import Grid from './grid';
import el from './el';

const Card = el.div`w-full h-full bg-gray`;

function App() {
    const items = [
        {
            id: 'a',
            rows: [1, 2],
            cols: [0, 1],
            children: <Card />,
        },
        {
            id: 'b',
            rows: [0, 2],
            cols: [1, 2],
            children: <Card />,
        },
    ];

    return (
        <div>
            <Grid
                row={5}
                cols={5}
                items={items}
                className="w-screen h-screen"
            />
        </div>
    );
}

export default App;
