import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Stack,
  CardActions,
  Avatar,
  Rating,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import courseService from '../services/courseService';
import { useSelector } from 'react-redux';

// Styled components
const HeroSection = styled(Box)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: theme.palette.common.white,
  padding: theme.spacing(15, 0),
  textAlign: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const TestimonialCard = styled(Card)(({ theme }) => ({
  height: '100%',
  padding: theme.spacing(3),
  textAlign: 'center',
}));

const Home = () => {
  const { i18n } = useTranslation();
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isRTL = i18n.language === 'fa';
  const isAuthenticated = useSelector(state => state.auth.isAuthenticated);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, testimonialsData] = await Promise.all([
          courseService.getFeaturedCourses(),
          courseService.getTestimonials()
        ]);
        setFeaturedCourses(coursesData);
        setTestimonials(testimonialsData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>{isRTL ? 'در حال بارگذاری...' : 'Loading...'}</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          {isRTL ? 'تلاش مجدد' : 'Try Again'}
        </Button>
      </Box>
    );
  }

  return (
    <Box dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <HeroSection>
        <Container maxWidth="md">
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '2.5rem', md: '4rem' },
              fontWeight: 'bold',
              mb: 3,
              textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
            }}
          >
            {isRTL ? 'به پلتفرم آموزشی خوش آمدید' : 'Welcome to Educational Platform'}
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            {isRTL ? 'سفر یادگیری خود را امروز آغاز کنید' : 'Start your learning journey today'}
          </Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            {!isAuthenticated && (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                component={Link}
                to="/register"
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: '50px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 6px 8px rgba(0,0,0,0.2)',
                  }
                }}
              >
                {isRTL ? 'ثبت‌نام' : 'Register'}
              </Button>
            )}
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/courses"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: '50px',
                borderWidth: '2px',
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderWidth: '2px',
                  borderColor: 'white',
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                }
              }}
            >
              {isRTL ? 'مشاهده دوره‌ها' : 'Browse Courses'}
            </Button>
          </Stack>
        </Container>
      </HeroSection>

      {/* Featured Courses Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Typography
          variant="h2"
          align="center"
          sx={{
            mb: 6,
            fontSize: { xs: '2rem', md: '2.5rem' },
            fontWeight: 'bold',
            position: 'relative',
            '&::after': {
              content: '""',
              display: 'block',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              margin: '16px auto',
              borderRadius: '2px'
            }
          }}
        >
          {isRTL ? 'دوره‌های ویژه' : 'Featured Courses'}
        </Typography>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 4 }}>{error}</Alert>
        ) : (
          <Grid container spacing={4}>
            {featuredCourses.map((course) => (
              <Grid item xs={12} sm={6} md={4} key={course.id}>
                <StyledCard>
                  <CardMedia
                    component="img"
                    height="200"
                    image={course.image || '/images/default-course.jpg'}
                    alt={course.title}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-course.jpg';
                    }}
                    sx={{
                      objectFit: 'cover',
                      borderBottom: '4px solid',
                      borderColor: 'primary.main'
                    }}
                  />
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      gutterBottom
                      variant="h5"
                      component="h2"
                      sx={{ fontWeight: 'bold', mb: 2 }}
                    >
                      {course.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {course.description}
                    </Typography>
                    <Box sx={{ mt: 'auto' }}>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        sx={{ fontWeight: 'bold' }}
                      >
                        {new Intl.NumberFormat('fa-IR', {
                          style: 'currency',
                          currency: 'IRR'
                        }).format(course.price)}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      component={Link}
                      to={`/courses/${course.id}`}
                      variant="contained"
                      fullWidth
                      sx={{
                        borderRadius: '50px',
                        py: 1,
                        textTransform: 'none'
                      }}
                    >
                      {isRTL ? 'مشاهده جزئیات' : 'View Details'}
                    </Button>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'grey.50', py: { xs: 6, md: 8 }, borderRadius: { md: '50px 50px 0 0' } }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            sx={{
              mb: 6,
              fontSize: { xs: '2rem', md: '2.5rem' },
              fontWeight: 'bold',
              position: 'relative',
              '&::after': {
                content: '""',
                display: 'block',
                width: '60px',
                height: '4px',
                backgroundColor: 'primary.main',
                margin: '16px auto',
                borderRadius: '2px'
              }
            }}
          >
            {isRTL ? 'نظرات دانشجویان' : 'Student Testimonials'}
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} md={4} key={testimonial.id}>
                <TestimonialCard>
                  <Avatar
                    src={testimonial.avatar || '/images/default-avatar.jpg'}
                    sx={{
                      width: 80,
                      height: 80,
                      mx: 'auto',
                      mb: 2,
                      border: '3px solid',
                      borderColor: 'primary.main'
                    }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/images/default-avatar.jpg';
                    }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {testimonial.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    {testimonial.comment}
                  </Typography>
                  <Rating value={testimonial.rating} readOnly sx={{ mt: 'auto' }} />
                </TestimonialCard>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 