import React from 'react';
import { ThemeProvider, createTheme, CssBaseline, Grid, Box, Typography } from '@mui/material';
import Chat from './components/Chat';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#25D366', // WhatsApp green
    },
    secondary: {
      main: '#128C7E', // WhatsApp dark green
    },
    background: {
      default: '#f0f2f5',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          height: '100vh',
          overflow: 'hidden',
        },
      },
    },
  },
});

function App() {
  // Create two different user IDs for sender and receiver
  const senderId = 'sender-user';
  const receiverId = 'receiver-user';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        p: 2, 
        height: '100vh', 
        bgcolor: '#f0f2f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Grid container spacing={4} sx={{ height: '100%', maxWidth: '1200px' }}>
          {/* Sender's Mobile Screen */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              width: '320px',
              height: '600px',
              bgcolor: '#000',
              borderRadius: '25px',
              p: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                bgcolor: '#333',
                borderRadius: '2px',
                zIndex: 1
              }
            }}>
              <Box sx={{ 
                width: '100%',
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'primary.main', 
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  📱 Sender's Phone
                </Typography>
                <Box sx={{ height: 'calc(100% - 60px)' }}>
                  <Chat userId={senderId} role="sender" />
                </Box>
              </Box>
            </Box>
          </Grid>

          {/* Receiver's Mobile Screen */}
          <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              width: '320px',
              height: '600px',
              bgcolor: '#000',
              borderRadius: '25px',
              p: '8px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '15px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '60px',
                height: '4px',
                bgcolor: '#333',
                borderRadius: '2px',
                zIndex: 1
              }
            }}>
              <Box sx={{ 
                width: '100%',
                height: '100%',
                bgcolor: 'background.paper',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'secondary.main', 
                    color: 'white',
                    textAlign: 'center',
                    fontSize: '14px',
                    fontWeight: 500
                  }}
                >
                  📱 Receiver's Phone
                </Typography>
                <Box sx={{ height: 'calc(100% - 60px)' }}>
                  <Chat userId={receiverId} role="receiver" />
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
}

export default App; 