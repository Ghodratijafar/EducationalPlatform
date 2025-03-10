import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Grid,
    Typography,
    Button,
    Card,
    CardContent,
    Avatar,
    Rating,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Chip,
    Skeleton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Alert
} from '@mui/material';
import {
    PlayCircleOutline,
    ExpandMore,
    AccessTime,
    School,
    Assignment,
    Star,
    CheckCircle,
    Lock
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import {
    fetchCourseById,
    enrollInCourse,
    rateCourse
} from '../../store/slices/courseSlice';

// Styled Components
const HeroSection = styled(Box)(({ theme }) => ({
    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
    color: theme.palette.common.white,
    padding: theme.spacing(8, 0),
    position: 'relative',
    overflow: 'hidden',
}));

const CourseImage = styled('img')({
    width: '100%',
    height: 'auto',
    borderRadius: 8,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
});

const StyledRating = styled(Rating)(({ theme }) => ({
    '& .MuiRating-iconFilled': {
        color: theme.palette.secondary.main,
    },
}));

const CourseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const {
        currentCourse,
        courseLoading,
        courseError,
        enrollmentLoading
    } = useSelector((state) => state.courses);
    const { isAuthenticated } = useSelector((state) => state.auth);

    // Local state
    const [ratingDialogOpen, setRatingDialogOpen] = useState(false);
    const [userRating, setUserRating] = useState(0);
    const [userReview, setUserReview] = useState('');

    useEffect(() => {
        dispatch(fetchCourseById(id));
    }, [dispatch, id]);

    const handleEnroll = () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: `/courses/${id}` } });
            return;
        }
        dispatch(enrollInCourse(id));
    };

    const handleRateSubmit = () => {
        dispatch(
            rateCourse({
                courseId: id,
                rating: userRating,
                review: userReview,
            })
        );
        setRatingDialogOpen(false);
    };

    if (courseLoading) {
        return (
            <Box sx={{ pt: 8 }}>
                <Container maxWidth="lg">
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={8}>
                            <Skeleton variant="rectangular" height={400} />
                            <Skeleton variant="text" height={60} sx={{ mt: 2 }} />
                            <Skeleton variant="text" height={30} width="60%" />
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Skeleton variant="rectangular" height={300} />
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        );
    }

    if (courseError) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error">{courseError}</Alert>
            </Container>
        );
    }

    if (!currentCourse) return null;

    return (
        <Box>
            {/* Hero Section */}
            <HeroSection>
                <Container maxWidth="lg">
                    <Grid container spacing={4} alignItems="center">
                        <Grid item xs={12} md={7}>
                            <Typography variant="h3" component="h1" gutterBottom>
                                {currentCourse.title}
                            </Typography>
                            <Typography variant="h6" paragraph>
                                {currentCourse.shortDescription}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                                <StyledRating value={currentCourse.rating} precision={0.5} readOnly />
                                <Typography>
                                    ({currentCourse.ratingCount} {t('courses.ratings')})
                                </Typography>
                                <Chip
                                    label={t(`courses.level.${currentCourse.level}`)}
                                    color="secondary"
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                            <Typography variant="subtitle1" paragraph>
                                {t('courses.instructor')}: {currentCourse.instructor?.name || t('courses.noInstructor')}
                            </Typography>
                            <Typography variant="subtitle1">
                                {t('courses.lastUpdated')}: {new Date(currentCourse.updatedAt).toLocaleDateString()}
                            </Typography>
                        </Grid>
                        <Grid item xs={12} md={5}>
                            <Card>
                                <CardContent>
                                    <CourseImage
                                        src={currentCourse.image || '/images/default-course.jpg'}
                                        alt={currentCourse.title}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-course.jpg';
                                        }}
                                    />
                                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                                        <Typography variant="h4" color="primary" gutterBottom>
                                            {currentCourse.price === 0
                                                ? t('courses.free')
                                                : `${currentCourse.price.toLocaleString()} ${t('courses.currency')}`}
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            color="primary"
                                            size="large"
                                            fullWidth
                                            onClick={handleEnroll}
                                            disabled={enrollmentLoading || currentCourse.isEnrolled}
                                        >
                                            {currentCourse.isEnrolled
                                                ? t('courses.enrolled')
                                                : enrollmentLoading
                                                ? t('common.loading')
                                                : t('courses.enroll')}
                                        </Button>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>
                </Container>
            </HeroSection>

            {/* Course Content */}
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        {/* Course Description */}
                        <Typography variant="h5" gutterBottom>
                            {t('courses.about')}
                        </Typography>
                        <Typography paragraph>{currentCourse.description}</Typography>
                        <Divider sx={{ my: 4 }} />

                        {/* Learning Objectives */}
                        <Typography variant="h5" gutterBottom>
                            {t('courses.objectives')}
                        </Typography>
                        <List>
                            {currentCourse.objectives?.map((objective, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <CheckCircle color="primary" />
                                    </ListItemIcon>
                                    <ListItemText primary={objective} />
                                </ListItem>
                            ))}
                        </List>
                        <Divider sx={{ my: 4 }} />

                        {/* Course Curriculum */}
                        <Typography variant="h5" gutterBottom>
                            {t('courses.curriculum')}
                        </Typography>
                        {currentCourse.sections?.map((section) => (
                            <Accordion key={section.id}>
                                <AccordionSummary expandIcon={<ExpandMore />}>
                                    <Typography variant="subtitle1">{section.title}</Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <List>
                                        {section.lessons.map((lesson) => (
                                            <ListItem
                                                key={lesson.id}
                                                sx={{
                                                    '&:hover': {
                                                        backgroundColor: 'action.hover',
                                                    },
                                                }}
                                            >
                                                <ListItemIcon>
                                                    {currentCourse.isEnrolled ? (
                                                        <PlayCircleOutline />
                                                    ) : (
                                                        <Lock color="action" />
                                                    )}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={lesson.title}
                                                    secondary={`${lesson.duration} ${t('courses.minutes')}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </AccordionDetails>
                            </Accordion>
                        ))}
                    </Grid>

                    <Grid item xs={12} md={4}>
                        {/* Course Stats */}
                        <Card sx={{ mb: 4 }}>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('courses.includes')}
                                </Typography>
                                <List>
                                    <ListItem>
                                        <ListItemIcon>
                                            <AccessTime color="primary" />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={`${currentCourse.duration} ${t('courses.hoursContent')}`}
                                        />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <Assignment color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('courses.assignments')} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <School color="primary" />
                                        </ListItemIcon>
                                        <ListItemText primary={t('courses.certificate')} />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>

                        {/* Instructor Info */}
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {t('courses.instructor')}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    <Avatar
                                        src={currentCourse.instructor?.avatar || '/images/default-avatar.jpg'}
                                        sx={{ width: 64, height: 64, mr: 2 }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/default-avatar.jpg';
                                        }}
                                    />
                                    <Box>
                                        <Typography variant="subtitle1">
                                            {currentCourse.instructor?.name || t('courses.noInstructor')}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {currentCourse.instructor?.title || t('courses.noTitle')}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Typography variant="body2" paragraph>
                                    {currentCourse.instructor?.bio || t('courses.noBio')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Reviews Section */}
                <Box sx={{ mt: 8 }}>
                    <Typography variant="h5" gutterBottom>
                        {t('courses.reviews')}
                    </Typography>
                    {currentCourse.isEnrolled && (
                        <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<Star />}
                            onClick={() => setRatingDialogOpen(true)}
                            sx={{ mb: 3 }}
                        >
                            {t('courses.addReview')}
                        </Button>
                    )}
                    <Grid container spacing={3}>
                        {currentCourse.reviews?.map((review) => (
                            <Grid item xs={12} key={review.id}>
                                <Card>
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            <Avatar
                                                src={review.user?.avatar || '/images/default-avatar.jpg'}
                                                sx={{ mr: 2 }}
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = '/images/default-avatar.jpg';
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1">{review.user.name}</Typography>
                                                <StyledRating value={review.rating} readOnly size="small" />
                                            </Box>
                                        </Box>
                                        <Typography variant="body2">{review.comment}</Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Rating Dialog */}
            <Dialog open={ratingDialogOpen} onClose={() => setRatingDialogOpen(false)}>
                <DialogTitle>{t('courses.addReview')}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography>{t('courses.rating')}:</Typography>
                            <StyledRating
                                value={userRating}
                                onChange={(event, newValue) => setUserRating(newValue)}
                            />
                        </Box>
                        <TextField
                            multiline
                            rows={4}
                            variant="outlined"
                            label={t('courses.review')}
                            value={userReview}
                            onChange={(e) => setUserReview(e.target.value)}
                            fullWidth
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRatingDialogOpen(false)}>{t('common.cancel')}</Button>
                    <Button onClick={handleRateSubmit} variant="contained" color="primary">
                        {t('common.submit')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseDetail; 