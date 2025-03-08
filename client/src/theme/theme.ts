import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    margin: '8px', // Adds margin around all buttons
                    padding: '8px 16px', // Adds padding inside buttons
                },
            },
        },
    },
});

export default theme;