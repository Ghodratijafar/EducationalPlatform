import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  InputAdornment,
  MenuItem,
  Rating,
  Chip,
  Pagination,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Search as SearchIcon,
  Sort as SortIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { fetchCourses } from '../../store/slices/courseSlice';

// Styled Components
const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const CourseImage = styled(CardMedia)({
  paddingTop: '56.25%', // 16:9 aspect ratio
  position: 'relative',
});

const PriceChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.common.white,
  fontWeight: 'bold',
}));

const LevelChip = styled(Chip)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  left: 16,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const CourseList = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { courses, loading, error } = useSelector((state) => {
    console.log('Redux state:', state);
    return state.courses;
  });
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterLevel, setFilterLevel] = useState('all');
  const [page, setPage] = useState(1);
  const coursesPerPage = 9;

  useEffect(() => {
      console.log('CourseList mounted');
      dispatch(fetchCourses());
  }, [dispatch]);

  const handleCourseAction = (courseId) => {
      if (isAuthenticated) {
          navigate(`/courses/${courseId}`);
      } else {
          navigate('/login', { state: { from: `/courses/${courseId}` } });
      }
  };


  useEffect(() => {
    console.log('Courses updated:', courses);
  }, [courses]);

  // Filter and sort courses
  const filteredAndSortedCourses = React.useMemo(() => {
    console.log('Filtering and sorting courses:', courses);
    if (!courses) return [];
    
    let result = [...courses];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply level filter
    if (filterLevel !== 'all') {
      result = result.filter((course) => course.level === filterLevel);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }

    return result;
  }, [courses, searchTerm, filterLevel, sortBy]);

  // Pagination
  const totalPages = Math.ceil((filteredAndSortedCourses?.length || 0) / coursesPerPage);
  const currentCourses = filteredAndSortedCourses?.slice(
    (page - 1) * coursesPerPage,
    page * coursesPerPage
  );

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {[...Array(6)].map((_, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <StyledCard>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" height={32} />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {t('errors.courses.fetch')} - {error}
        </Alert>
        <Button
          variant="contained"
          color="primary"
          onClick={() => dispatch(fetchCourses())}
        >
          {t('common.retry')}
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Search and Filter Section */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('courses.search')}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SortIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="newest">{t('courses.sort.newest')}</MenuItem>
              <MenuItem value="price-low">{t('courses.sort.priceLow')}</MenuItem>
              <MenuItem value="price-high">{t('courses.sort.priceHigh')}</MenuItem>
              <MenuItem value="rating">{t('courses.sort.rating')}</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select
              fullWidth
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FilterIcon />
                  </InputAdornment>
                ),
              }}
            >
              <MenuItem value="all">{t('courses.level.all')}</MenuItem>
              <MenuItem value="beginner">{t('courses.level.beginner')}</MenuItem>
              <MenuItem value="intermediate">{t('courses.level.intermediate')}</MenuItem>
              <MenuItem value="advanced">{t('courses.level.advanced')}</MenuItem>
            </TextField>
          </Grid>
        </Grid>
      </Box>

      {/* Course Grid */}
      {currentCourses?.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h5" color="textSecondary">
            {t('courses.noCourses')}
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={4}>
            {currentCourses?.map((course) => (
              <Grid item key={course.id} xs={12} sm={6} md={4}>
                <StyledCard>
                  <CourseImage
                    image={course.thumbnail || '/placeholder-course.jpg'}
                    title={course.title}
                  >
                    <PriceChip
                      label={
                        course.price === 0
                          ? t('courses.free')
                          : `$${course.price}`
                      }
                    />
                    <LevelChip label={t(`courses.level.${course.level}`)} />
                  </CourseImage>
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2">
                      {course.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 2,
                      }}
                    >
                      <Rating
                        value={course.rating || 0}
                        readOnly
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="textSecondary">
                        ({course.ratingCount || 0})
                      </Typography>
                    </Box>
                    <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={() => handleCourseAction(course.id)}
                    >
                        {isAuthenticated ? t('courses.viewDetails') : t('courses.login')}
                    </Button>
                  </CardContent>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default CourseList; 