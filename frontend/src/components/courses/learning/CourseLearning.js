import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Grid,
  Container,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  LinearProgress,
  Drawer,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  PlayCircleOutline,
  CheckCircle,
  RadioButtonUnchecked,
  MenuBook,
  Assignment,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import courseService from '../../../services/courseService';
import {
  fetchCourseStart,
  fetchCourseSuccess,
  fetchCourseFailure,
} from '../../../store/slices/courseSlice';
import LessonContent from './LessonContent';
import LessonNotes from './LessonNotes';

const CourseLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { course, isLoading, error } = useSelector((state) => state.course);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [progress, setProgress] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchCourseData = async () => {
      try {
        dispatch(fetchCourseStart());
        const data = await courseService.getCourseById(id);
        if (!data.isEnrolled) {
          navigate(`/courses/${id}`);
          return;
        }
        dispatch(fetchCourseSuccess(data));
        // Load saved progress
        const savedProgress = await courseService.getCourseProgress(id);
        setProgress(savedProgress);
        // Set current lesson to last viewed or first incomplete lesson
        const lastViewedIndex = savedProgress.lastViewedLesson || 0;
        setCurrentLessonIndex(lastViewedIndex);
      } catch (error) {
        dispatch(fetchCourseFailure(error.message));
      }
    };

    fetchCourseData();
  }, [dispatch, id, isAuthenticated, navigate]);

  const handleLessonChange = async (index) => {
    setCurrentLessonIndex(index);
    try {
      await courseService.updateLessonProgress(id, course.lessons[index].id, {
        lastViewed: true,
      });
    } catch (error) {
      console.error('Error updating lesson progress:', error);
    }
  };

  const handleLessonComplete = async (index) => {
    const updatedProgress = {
      ...progress,
      completedLessons: {
        ...progress.completedLessons,
        [course.lessons[index].id]: true,
      },
    };
    setProgress(updatedProgress);
    try {
      await courseService.updateLessonProgress(id, course.lessons[index].id, {
        completed: true,
      });
    } catch (error) {
      console.error('Error marking lesson as complete:', error);
    }
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!course || !course.lessons) {
    return null;
  }

  const currentLesson = course.lessons[currentLessonIndex];
  const completedLessonsCount = Object.values(progress.completedLessons || {}).filter(Boolean).length;
  const totalProgress = (completedLessonsCount / course.lessons.length) * 100;

  const lessonList = (
    <Box sx={{ width: 300, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Course Content</Typography>
        {isMobile && (
          <IconButton onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      <LinearProgress
        variant="determinate"
        value={totalProgress}
        sx={{ mx: 2, mb: 2 }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ px: 2, mb: 2 }}>
        {completedLessonsCount} of {course.lessons.length} completed ({Math.round(totalProgress)}%)
      </Typography>
      <Divider />
      <List sx={{ flexGrow: 1, overflow: 'auto' }}>
        {course.lessons.map((lesson, index) => (
          <ListItem key={lesson.id} disablePadding>
            <ListItemButton
              selected={currentLessonIndex === index}
              onClick={() => handleLessonChange(index)}
            >
              <ListItemIcon>
                {progress.completedLessons?.[lesson.id] ? (
                  <CheckCircle color="success" />
                ) : currentLessonIndex === index ? (
                  <PlayCircleOutline color="primary" />
                ) : (
                  <RadioButtonUnchecked />
                )}
              </ListItemIcon>
              <ListItemText
                primary={lesson.title}
                secondary={lesson.duration}
                primaryTypographyProps={{
                  variant: 'body2',
                  color: progress.completedLessons?.[lesson.id] ? 'text.secondary' : 'text.primary',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {isMobile ? (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            '& .MuiDrawer-paper': {
              width: 300,
            },
          }}
        >
          {lessonList}
        </Drawer>
      ) : (
        <Paper
          elevation={2}
          sx={{
            width: 300,
            display: drawerOpen ? 'block' : 'none',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {lessonList}
        </Paper>
      )}

      <Box sx={{ flexGrow: 1, height: '100%', overflow: 'auto' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <IconButton
            sx={{ mr: 2, display: { md: 'none' } }}
            onClick={toggleDrawer}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">{currentLesson.title}</Typography>
        </Box>

        <Grid container sx={{ height: 'calc(100% - 64px)' }}>
          <Grid item xs={12} md={8} sx={{ height: '100%', overflow: 'auto' }}>
            <LessonContent
              lesson={currentLesson}
              onComplete={() => handleLessonComplete(currentLessonIndex)}
              isCompleted={progress.completedLessons?.[currentLesson.id]}
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ height: '100%', borderLeft: 1, borderColor: 'divider' }}>
            <LessonNotes
              courseId={id}
              lessonId={currentLesson.id}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default CourseLearning; 