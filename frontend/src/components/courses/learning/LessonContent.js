import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    Button,
    IconButton,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    PlayCircleOutline,
    CheckCircle,
    RadioButtonUnchecked,
    MenuBook,
    Close as CloseIcon,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import courseService from '../../../services/courseService';
import LessonNotes from './LessonNotes';

const LessonContent = () => {
    const { courseId, lessonId } = useParams();
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showNotes, setShowNotes] = useState(false);

    // Fetch lesson content
    useEffect(() => {
        const fetchLesson = async () => {
            try {
                setLoading(true);
                const data = await courseService.getLessonContent(courseId, lessonId);
                setLesson(data);
                setIsCompleted(data.isCompleted);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchLesson();
    }, [courseId, lessonId]);

    // Handle lesson completion
    const handleComplete = useCallback(() => {
        const markComplete = async () => {
            try {
                await courseService.markLessonComplete(courseId, lessonId);
                setIsCompleted(true);
            } catch (err) {
                setError(err.message);
            }
        };
        markComplete();
    }, [courseId, lessonId]);

    if (loading) {
        return (
            <Container>
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <CircularProgress />
                </Box>
            </Container>
        );
    }

    if (error) {
        return (
            <Container>
                <Alert severity="error" sx={{ mt: 4 }}>
                    {error}
                </Alert>
            </Container>
        );
    }

    if (!lesson) {
        return (
            <Container>
                <Alert severity="info" sx={{ mt: 4 }}>
                    Lesson not found
                </Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="xl">
            <Grid container spacing={2}>
                {/* Main Content */}
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Typography variant="h4" gutterBottom>
                            {lesson.title}
                        </Typography>
                        {lesson.videoUrl && (
                            <Box sx={{ position: 'relative', paddingTop: '56.25%', mb: 3 }}>
                                <ReactPlayer
                                    url={lesson.videoUrl}
                                    width="100%"
                                    height="100%"
                                    controls
                                    style={{ position: 'absolute', top: 0, left: 0 }}
                                />
                            </Box>
                        )}
                        <Typography variant="body1">{lesson.content}</Typography>
                        {lesson.attachments && lesson.attachments.length > 0 && (
                            <Box sx={{ mt: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Attachments
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {lesson.attachments.map((attachment) => (
                                        <Button
                                            key={attachment.id}
                                            variant="outlined"
                                            startIcon={<MenuBook />}
                                            href={attachment.url}
                                            target="_blank"
                                        >
                                            {attachment.name}
                                        </Button>
                                    ))}
                                </Box>
                            </Box>
                        )}
                        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={isCompleted ? <CheckCircle /> : <RadioButtonUnchecked />}
                                onClick={handleComplete}
                                disabled={isCompleted}
                            >
                                {isCompleted ? 'Completed' : 'Mark as Complete'}
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<PlayCircleOutline />}
                                onClick={() => setShowNotes(!showNotes)}
                            >
                                {showNotes ? 'Hide Notes' : 'Show Notes'}
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Notes Section */}
                <Grid item xs={12} md={4}>
                    {showNotes && (
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h6">Notes</Typography>
                                <IconButton onClick={() => setShowNotes(false)} size="small">
                                    <CloseIcon />
                                </IconButton>
                            </Box>
                            <LessonNotes courseId={courseId} lessonId={lessonId} />
                        </Paper>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};

export default LessonContent; 