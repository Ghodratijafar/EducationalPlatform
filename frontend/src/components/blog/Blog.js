import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    CardMedia,
    Button,
    Chip,
    CircularProgress,
    Alert,
    TextField,
    InputAdornment,
    IconButton,
    Paper,
    Divider,
    Menu,
    MenuItem,
    Badge,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import SortIcon from '@mui/icons-material/Sort';
import ShareIcon from '@mui/icons-material/Share';
import blogService from '../../services/blogService';

const Blog = () => {
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'fa';
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [tags, setTags] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedTag, setSelectedTag] = useState(null);
    const [sortBy, setSortBy] = useState('-created_at');
    const [sortAnchorEl, setSortAnchorEl] = useState(null);
    const [shareAnchorEl, setSortShareEl] = useState(null);
    const [selectedPost, setSelectedPost] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [postsData, categoriesData, tagsData] = await Promise.all([
                    blogService.getPosts({ ordering: sortBy }),
                    blogService.getCategories(),
                    blogService.getTags()
                ]);
                setPosts(postsData);
                setFilteredPosts(postsData);
                setCategories(categoriesData);
                setTags(tagsData);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [sortBy]);

    useEffect(() => {
        const filterPosts = () => {
            let filtered = [...posts];
            
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filtered = filtered.filter(post => 
                    post.title.toLowerCase().includes(searchLower) ||
                    post.excerpt.toLowerCase().includes(searchLower) ||
                    post.tags.some(tag => tag.name.toLowerCase().includes(searchLower))
                );
            }
            
            if (selectedCategory) {
                filtered = filtered.filter(post =>
                    post.categories.some(cat => cat.slug === selectedCategory)
                );
            }

            if (selectedTag) {
                filtered = filtered.filter(post =>
                    post.tags.some(tag => tag.slug === selectedTag)
                );
            }
            
            setFilteredPosts(filtered);
        };

        filterPosts();
    }, [searchTerm, selectedCategory, selectedTag, posts]);

    const handleSearch = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCategorySelect = (categorySlug) => {
        setSelectedCategory(categorySlug === selectedCategory ? null : categorySlug);
        setSelectedTag(null);
    };

    const handleTagSelect = (tagSlug) => {
        setSelectedTag(tagSlug === selectedTag ? null : tagSlug);
        setSelectedCategory(null);
    };

    const handleSortClick = (event) => {
        setSortAnchorEl(event.currentTarget);
    };

    const handleSortClose = () => {
        setSortAnchorEl(null);
    };

    const handleSortSelect = (value) => {
        setSortBy(value);
        handleSortClose();
    };

    const handleLike = async (slug) => {
        try {
            await blogService.likePost(slug);
            const updatedPosts = posts.map(post => {
                if (post.slug === slug) {
                    return {
                        ...post,
                        is_liked: !post.is_liked,
                        like_count: post.is_liked ? post.like_count - 1 : post.like_count + 1
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
            setFilteredPosts(updatedPosts);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBookmark = async (slug) => {
        try {
            await blogService.bookmarkPost(slug);
            const updatedPosts = posts.map(post => {
                if (post.slug === slug) {
                    return {
                        ...post,
                        is_bookmarked: !post.is_bookmarked,
                        bookmark_count: post.is_bookmarked ? post.bookmark_count - 1 : post.bookmark_count + 1
                    };
                }
                return post;
            });
            setPosts(updatedPosts);
            setFilteredPosts(updatedPosts);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShareClick = (event, post) => {
        setSelectedPost(post);
        setSortShareEl(event.currentTarget);
    };

    const handleShareClose = () => {
        setSortShareEl(null);
        setSelectedPost(null);
    };

    const handleShare = async (platform) => {
        if (selectedPost) {
            try {
                await blogService.sharePost(selectedPost.slug, platform);
                const shareUrls = blogService.getSocialShareUrls(selectedPost);
                window.open(shareUrls[platform], '_blank');
            } catch (err) {
                setError(err.message);
            }
        }
        handleShareClose();
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 6, backgroundColor: 'background.default' }} dir={isRTL ? 'rtl' : 'ltr'}>
            <Container maxWidth="lg">
                {/* Header with Background - Unchanged */}
                <Box sx={{ /* ... existing header styles ... */ }}>
                    <Typography variant="h1" sx={{ /* ... existing styles ... */ }}>
                        {isRTL ? 'وبلاگ' : 'Blog'}
                    </Typography>
                    <Typography variant="h5" sx={{ /* ... existing styles ... */ }}>
                        {isRTL ? 'آخرین مقالات و اخبار آموزشی' : 'Latest Articles and Educational News'}
                    </Typography>
                </Box>

                {/* Search, Filter, and Sort */}
                <Paper sx={{ mb: 6, p: 3, borderRadius: 2, background: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(10px)' }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                value={searchTerm}
                                onChange={handleSearch}
                                placeholder={isRTL ? 'جستجو در مقالات...' : 'Search articles...'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="primary" />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ /* ... existing styles ... */ }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    startIcon={<SortIcon />}
                                    onClick={handleSortClick}
                                    sx={{ mr: 2 }}
                                >
                                    {isRTL ? 'مرتب‌سازی' : 'Sort'}
                                </Button>
                                <Menu
                                    anchorEl={sortAnchorEl}
                                    open={Boolean(sortAnchorEl)}
                                    onClose={handleSortClose}
                                >
                                    <MenuItem onClick={() => handleSortSelect('-created_at')}>
                                        {isRTL ? 'جدیدترین' : 'Newest'}
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSortSelect('created_at')}>
                                        {isRTL ? 'قدیمی‌ترین' : 'Oldest'}
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSortSelect('-views')}>
                                        {isRTL ? 'پربازدیدترین' : 'Most Viewed'}
                                    </MenuItem>
                                    <MenuItem onClick={() => handleSortSelect('-like_count')}>
                                        {isRTL ? 'محبوب‌ترین' : 'Most Liked'}
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </Grid>
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                {isRTL ? 'دسته‌بندی‌ها' : 'Categories'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
                                <Chip
                                    label={isRTL ? 'همه' : 'All'}
                                    onClick={() => handleCategorySelect(null)}
                                    color={!selectedCategory ? 'primary' : 'default'}
                                    sx={{ /* ... existing styles ... */ }}
                                />
                                {categories.map((category) => (
                                    <Chip
                                        key={category.id}
                                        label={category.name}
                                        onClick={() => handleCategorySelect(category.slug)}
                                        color={selectedCategory === category.slug ? 'primary' : 'default'}
                                        sx={{ /* ... existing styles ... */ }}
                                    />
                                ))}
                            </Box>
                            <Typography variant="subtitle1" sx={{ mb: 2 }}>
                                {isRTL ? 'برچسب‌ها' : 'Tags'}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {tags.map((tag) => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        onClick={() => handleTagSelect(tag.slug)}
                                        color={selectedTag === tag.slug ? 'secondary' : 'default'}
                                        variant="outlined"
                                        size="small"
                                        sx={{ /* ... existing styles ... */ }}
                                    />
                                ))}
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>

                {/* Posts Grid */}
                <Grid container spacing={4}>
                    {filteredPosts.length > 0 ? (
                        filteredPosts.map((post) => (
                            <Grid item xs={12} md={6} lg={4} key={post.id}>
                                <Card sx={{ /* ... existing card styles ... */ }}>
                                    <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                                        <CardMedia
                                            component="img"
                                            height="220"
                                            image={post.featured_image || '/images/default-blog.jpg'}
                                            alt={post.title}
                                            sx={{ /* ... existing styles ... */ }}
                                        />
                                        <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(0,0,0,0.7))', p: 2 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Box sx={{ display: 'flex', gap: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <VisibilityIcon sx={{ fontSize: '0.9rem', color: 'white' }} />
                                                        <Typography variant="caption" sx={{ color: 'white' }}>
                                                            {post.views}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                        <CommentIcon sx={{ fontSize: '0.9rem', color: 'white' }} />
                                                        <Typography variant="caption" sx={{ color: 'white' }}>
                                                            {post.comment_count}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleLike(post.slug)}
                                                        sx={{ color: 'white' }}
                                                    >
                                                        <Badge badgeContent={post.like_count} color="error">
                                                            {post.is_liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                                                        </Badge>
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleBookmark(post.slug)}
                                                        sx={{ color: 'white' }}
                                                    >
                                                        {post.is_bookmarked ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => handleShareClick(e, post)}
                                                        sx={{ color: 'white' }}
                                                    >
                                                        <ShareIcon />
                                                    </IconButton>
                                                </Box>
                                            </Box>
                                        </Box>
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Typography gutterBottom variant="h5" component="h2" sx={{ /* ... existing styles ... */ }}>
                                            {post.title}
                                        </Typography>
                                        <Typography color="text.secondary" sx={{ /* ... existing styles ... */ }}>
                                            {post.excerpt}
                                        </Typography>
                                        <Box sx={{ mt: 'auto' }}>
                                            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                {post.tags.map((tag) => (
                                                    <Chip
                                                        key={tag.id}
                                                        label={tag.name}
                                                        size="small"
                                                        color="primary"
                                                        variant="outlined"
                                                        onClick={() => handleTagSelect(tag.slug)}
                                                        sx={{ /* ... existing styles ... */ }}
                                                    />
                                                ))}
                                            </Box>
                                            <Button
                                                component={Link}
                                                to={`/blog/${post.slug}`}
                                                variant="contained"
                                                fullWidth
                                                sx={{ /* ... existing styles ... */ }}
                                            >
                                                {isRTL ? 'ادامه مطلب' : 'Read More'}
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2, backgroundColor: 'background.paper' }}>
                                <Typography variant="h6" color="text.secondary" gutterBottom>
                                    {isRTL ? 'مقاله‌ای یافت نشد' : 'No articles found'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {isRTL ? 'لطفاً با کلمات کلیدی دیگری جستجو کنید' : 'Try searching with different keywords'}
                                </Typography>
                            </Paper>
                        </Grid>
                    )}
                </Grid>
            </Container>

            {/* Share Menu */}
            <Menu
                anchorEl={shareAnchorEl}
                open={Boolean(shareAnchorEl)}
                onClose={handleShareClose}
            >
                <MenuItem onClick={() => handleShare('facebook')}>Facebook</MenuItem>
                <MenuItem onClick={() => handleShare('twitter')}>Twitter</MenuItem>
                <MenuItem onClick={() => handleShare('linkedin')}>LinkedIn</MenuItem>
                <MenuItem onClick={() => handleShare('telegram')}>Telegram</MenuItem>
                <MenuItem onClick={() => handleShare('whatsapp')}>WhatsApp</MenuItem>
            </Menu>
        </Box>
    );
};

export default Blog;