import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Paper,
  Grid,
  Card,
  CardContent,
  useTheme,
  useMediaQuery,
  IconButton,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  Description,
  Image,
  PictureAsPdf,
  TableChart,
  InsertDriveFile,
  AccessTime,
  Label,
  Menu,
  ArrowBack
} from '@mui/icons-material';

const FileOrganizer = ({ files, onFileSelect }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [organizedFiles, setOrganizedFiles] = useState({
    byType: {},
    recent: [],
    trending: []
  });

  useEffect(() => {
    const organized = {
      byType: {},
      recent: [],
      trending: []
    };

    files.forEach(file => {
      // Organize by type
      const type = file.mimeType || 'unknown';
      if (!organized.byType[type]) {
        organized.byType[type] = [];
      }
      organized.byType[type].push(file);

      // Add to recent files
      organized.recent.push(file);
    });

    // Sort recent files by timestamp
    organized.recent.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );

    // Calculate trending files based on access count
    organized.trending = [...files]
      .sort((a, b) => (b.accessCount || 0) - (a.accessCount || 0))
      .slice(0, 5);

    setOrganizedFiles(organized);
  }, [files]);

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image />;
    if (mimeType?.includes('pdf')) return <PictureAsPdf />;
    if (mimeType?.includes('excel') || mimeType?.includes('spreadsheet')) return <TableChart />;
    if (mimeType?.includes('word') || mimeType?.includes('document')) return <Description />;
    return <InsertDriveFile />;
  };

  const FileList = ({ files, title, icon }) => (
    <Card variant="outlined" sx={{ 
      height: '100%', 
      bgcolor: 'white',
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1, fontWeight: 500 }}>{title}</Typography>
        </Box>
        <List dense sx={{ p: 0 }}>
          {files.map((file, index) => (
            <ListItem
              key={index}
              button
              onClick={() => onFileSelect(file)}
              sx={{
                borderRadius: 1,
                mb: 1,
                '&:hover': { 
                  bgcolor: '#f0f2f5',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease'
                }
              }}
            >
              <ListItemIcon>
                {getFileIcon(file.mimeType)}
              </ListItemIcon>
              <ListItemText
                primary={
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {file.fileName}
                  </Typography>
                }
                secondary={
                  <>
                    <Typography variant="caption" display="block" color="textSecondary">
                      {new Date(file.timestamp).toLocaleDateString()}
                    </Typography>
                    {file.accessCount > 0 && (
                      <Chip
                        size="small"
                        label={`${file.accessCount} views`}
                        sx={{ 
                          mt: 0.5,
                          bgcolor: '#25D366',
                          color: 'white',
                          fontSize: '0.7rem'
                        }}
                      />
                    )}
                  </>
                }
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const MobileDrawer = () => (
    <Drawer
      anchor="left"
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: '280px',
          bgcolor: '#f0f2f5'
        }
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
          File Categories
        </Typography>
        {Object.entries(organizedFiles.byType).map(([type, files]) => (
          <Paper
            key={type}
            elevation={0}
            sx={{
              p: 2,
              mb: 2,
              bgcolor: 'white',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {getFileIcon(type)}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {type.split('/')[1]?.toUpperCase() || 'Unknown'}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {files.length} file{files.length !== 1 ? 's' : ''}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>
    </Drawer>
  );

  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', bgcolor: '#f0f2f5' }}>
        <AppBar position="static" sx={{ bgcolor: '#075E54' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDrawerOpen(true)}
            >
              <Menu />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 500 }}>
              Files
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FileList
                files={organizedFiles.recent.slice(0, 5)}
                title="Recent Files"
                icon={<AccessTime />}
              />
            </Grid>
            <Grid item xs={12}>
              <FileList
                files={organizedFiles.trending}
                title="Popular Files"
                icon={<Label />}
              />
            </Grid>
          </Grid>
        </Box>
        
        <MobileDrawer />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, height: '100vh', bgcolor: '#f0f2f5' }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        <Grid item xs={12} md={6}>
          <FileList
            files={organizedFiles.recent.slice(0, 5)}
            title="Recent Files"
            icon={<AccessTime />}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FileList
            files={organizedFiles.trending}
            title="Popular Files"
            icon={<Label />}
          />
        </Grid>
        <Grid item xs={12}>
          <Card variant="outlined" sx={{ 
            bgcolor: 'white',
            borderRadius: 2,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>File Categories</Typography>
              <Grid container spacing={2}>
                {Object.entries(organizedFiles.byType).map(([type, files]) => (
                  <Grid item xs={12} sm={6} md={4} key={type}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 2,
                        bgcolor: '#f8f9fa',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        border: '1px solid #e9ecef',
                        '&:hover': {
                          bgcolor: '#e9ecef',
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s ease'
                        }
                      }}
                    >
                      {getFileIcon(type)}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {type.split('/')[1]?.toUpperCase() || 'Unknown'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {files.length} file{files.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileOrganizer; 