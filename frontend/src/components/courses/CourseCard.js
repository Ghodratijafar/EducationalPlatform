import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Person, AccessTime } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!course) return null;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="200"
        image={course.thumbnail || 'https://source.unsplash.com/random/800x600/?education'}
        alt={course.title}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ mb: 2 }}>
          <Chip
            label={course.category?.name || t('courses.uncategorized')}
            size="small"
            color="primary"
            sx={{ mb: 1 }}
          />
          <Typography gutterBottom variant="h5" component="h2">
            {course.title}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              mb: 2,
            }}
          >
            {course.description}
          </Typography>
        </Box>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {course.instructor?.username || t('courses.unknownInstructor')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {course.duration ? `${course.duration} ${t('courses.minutes')}` : t('courses.defaultDuration')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={course.rating || 0} readOnly size="small" precision={0.5} />
            <Typography variant="body2" color="text.secondary">
              ({course.rating_count || 0} {t('courses.ratings')})
            </Typography>
          </Box>
        </Stack>
      </CardContent>

      <Box sx={{ p: 2, pt: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" component="span">
            {course.price === 0 ? t('courses.free') : `${course.price} ${t('courses.currency')}`}
          </Typography>
          {course.is_enrolled && (
            <Chip label={t('courses.enrolled')} color="success" size="small" />
          )}
        </Box>
        <Button
          variant="contained"
          fullWidth
          onClick={() => navigate(`/courses/${course.id}`)}
        >
          {course.is_enrolled ? t('courses.continueLearning') : t('courses.viewDetails')}
        </Button>
      </Box>
    </Card>
  );
};

export default CourseCard; 