import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { fetchEnrolledCourses } from '../../store/slices/courseSlice';
import { fetchUserNotes } from '../../store/slices/noteSlice';
import CourseRecommendations from '../courses/CourseRecommendations';

const StudentDashboard = () => {
  const dispatch = useDispatch();
  const { enrolledCourses, loading: coursesLoading } = useSelector((state) => state.course);
  const { userNotes, loading: notesLoading } = useSelector((state) => state.note);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
    dispatch(fetchUserNotes());
  }, [dispatch]);

  const CourseProgressCard = ({ course }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {course.title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: '100%', mr: 1 }}>
            <LinearProgress
              variant="determinate"
              value={course.progress}
              sx={{ height: 10, borderRadius: 5 }}
            />
          </Box>
          <Box sx={{ minWidth: 35 }}>
            <Typography variant="body2" color="text.secondary">
              {`${Math.round(course.progress)}%`}
            </Typography>
          </Box>
        </Box>
        <Button
          component={RouterLink}
          to={`/courses/${course.id}`}
          variant="contained"
          size="small"
          sx={{ mt: 1 }}
        >
          Continue Learning
        </Button>
      </CardContent>
    </Card>
  );

  const RecentActivityCard = () => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Activity
      </Typography>
      <List>
        {recentActivities.map((activity, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={activity.description}
                secondary={activity.date}
              />
            </ListItem>
            {index < recentActivities.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );

  const NotesOverviewCard = () => (
    <Paper sx={{ p: 2, height: '100%' }}>
      <Typography variant="h6" gutterBottom>
        Recent Notes
      </Typography>
      <List>
        {userNotes.slice(0, 5).map((note) => (
          <ListItem key={note.id}>
            <ListItemText
              primary={note.lesson_title}
              secondary={note.content.substring(0, 100) + '...'}
            />
          </ListItem>
        ))}
      </List>
      <Button
        component={RouterLink}
        to="/notes"
        variant="outlined"
        fullWidth
        sx={{ mt: 2 }}
      >
        View All Notes
      </Button>
    </Paper>
  );

  if (coursesLoading || notesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Dashboard
      </Typography>
      <Grid container spacing={3}>
        {/* Enrolled Courses */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Enrolled Courses
            </Typography>
            {enrolledCourses.map((course) => (
              <CourseProgressCard key={course.id} course={course} />
            ))}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={4}>
          <RecentActivityCard />
        </Grid>

        {/* Notes Overview */}
        <Grid item xs={12} md={6}>
          <NotesOverviewCard />
        </Grid>

        {/* Course Recommendations */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recommended for You
            </Typography>
            <CourseRecommendations />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard; 