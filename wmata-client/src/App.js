import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import Canvas from './components/Canvas.js';

const theme = createTheme({
    palette: {
        mode: "dark",
        primary: {
            main: "#CDBE78",
        },
        secondary: {
            main: "#383838",
        }
    },
    typography: {
        fontFamily: [
            "Helvetica Neue",
        ].join(','),
    },
});


function App() {
    return (
        <ThemeProvider theme={theme}>
            <Canvas />
        </ThemeProvider>
    );
}

export default App;
