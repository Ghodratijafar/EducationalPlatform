import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Chip,
  Rating,
  CircularProgress,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import {
  fetchRecommendedCourses,
  fetchPersonalizedSuggestions,
  fetchPopularCourses,
  fetchTrendingTopics,
} from '../../store/slices/recommendationSlice';

const CourseRecommendations = () => {
  const dispatch = useDispatch();
  const [tabValue, setTabValue] = React.useState(0);
  const {
    recommendedCourses,
    personalizedSuggestions,
    popularCourses,
    trendingTopics,
    loading,
    error,
  } = useSelector((state) => state.recommendation);

  useEffect(() => {
    dispatch(fetchRecommendedCourses());
    dispatch(fetchPersonalizedSuggestions());
    dispatch(fetchPopularCourses());
    dispatch(fetchTrendingTopics());
  }, [dispatch]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const CourseCard = ({ course }) => (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="140"
        image={course.thumbnail}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {course.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {course.description}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Rating value={course.rating} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({course.ratingCount})
          </Typography>
        </Box>
        <Box sx={{ mt: 1 }}>
          {course.tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{ mr: 0.5, mb: 0.5 }}
            />
          ))}
        </Box>
        <Button
          component={RouterLink}
          to={`/courses/${course.id}`}
          variant="contained"
          size="small"
          sx={{ mt: 2 }}
          fullWidth
        >
          Learn More
        </Button>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" sx={{ mt: 2 }}>
        Error loading recommendations: {error}
      </Typography>
    );
  }

  const tabPanels = [
    {
      label: 'Recommended',
      content: recommendedCourses,
    },
    {
      label: 'Personalized',
      content: personalizedSuggestions,
    },
    {
      label: 'Popular',
      content: popularCourses,
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="course recommendations tabs"
          variant="fullWidth"
        >
          {tabPanels.map((panel, index) => (
            <Tab key={index} label={panel.label} />
          ))}
        </Tabs>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Grid container spacing={3}>
          {tabPanels[tabValue].content.map((course) => (
            <Grid item key={course.id} xs={12} sm={6} md={4}>
              <CourseCard course={course} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {trendingTopics.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Trending Topics
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {trendingTopics.map((topic) => (
              <Chip
                key={topic.id}
                label={`${topic.name} (${topic.courseCount})`}
                onClick={() => {/* Handle topic click */}}
                sx={{ mb: 1 }}
              />
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CourseRecommendations; 