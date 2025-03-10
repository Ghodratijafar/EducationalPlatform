import React from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                src={user.avatar}
                alt={user.username}
                sx={{ width: 150, height: 150, mb: 2 }}
              />
              <Typography variant="h5" gutterBottom>
                {user.username}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Member since: {new Date(user.date_joined).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Email"
                  secondary={user.email}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Bio"
                  secondary={user.bio || 'No bio provided'}
                />
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Enrolled Courses"
                  secondary={user.enrolled_courses?.length || 0}
                />
              </ListItem>
            </List>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Profile; 