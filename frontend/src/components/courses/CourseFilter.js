import React from 'react';
import {
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Button,
  Slider,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters, resetFilters } from '../../store/slices/courseSlice';

const CourseFilter = () => {
  const dispatch = useDispatch();
  const filters = useSelector((state) => state.course.filters);

  const handleSearchChange = (event) => {
    dispatch(setFilters({ search: event.target.value }));
  };

  const handleCategoryChange = (event) => {
    dispatch(setFilters({ category: event.target.value }));
  };

  const handleLevelChange = (event) => {
    dispatch(setFilters({ level: event.target.value }));
  };

  const handlePriceChange = (event, newValue) => {
    dispatch(setFilters({ price: newValue }));
  };

  const handleReset = () => {
    dispatch(resetFilters());
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Search Courses"
          variant="outlined"
          value={filters.search}
          onChange={handleSearchChange}
          fullWidth
        />

        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="programming">Programming</MenuItem>
            <MenuItem value="design">Design</MenuItem>
            <MenuItem value="business">Business</MenuItem>
            <MenuItem value="marketing">Marketing</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Level</InputLabel>
          <Select
            value={filters.level}
            label="Level"
            onChange={handleLevelChange}
          >
            <MenuItem value="">All Levels</MenuItem>
            <MenuItem value="beginner">Beginner</MenuItem>
            <MenuItem value="intermediate">Intermediate</MenuItem>
            <MenuItem value="advanced">Advanced</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ px: 1 }}>
          <Typography gutterBottom>Price Range</Typography>
          <Slider
            value={filters.price}
            onChange={handlePriceChange}
            valueLabelDisplay="auto"
            min={0}
            max={1000}
            step={10}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">${filters.price[0]}</Typography>
            <Typography variant="body2">${filters.price[1]}</Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          color="secondary"
          onClick={handleReset}
          fullWidth
        >
          Reset Filters
        </Button>
      </Box>
    </Paper>
  );
};

export default CourseFilter; 