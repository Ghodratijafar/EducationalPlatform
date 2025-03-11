import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import {
    Box,
    Container,
    Typography,
    Card,
    CardContent,
    Avatar,
    Button,
    TextField,
    CircularProgress,
    Alert,
    IconButton,
    Chip,
    Divider,
    Paper,
    Menu,
    MenuItem,
    Grid,
    Collapse,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import ReplyIcon from '@mui/icons-material/Reply';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import VisibilityIcon from '@mui/icons-material/Visibility';
import blogService from '../../services/blogService';

const ErrorMessage = ({ error, onClose }) => (
    <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        onClose={onClose}
    >
        {error}
    </Alert>
);

const CommentForm = ({ onSubmit, initialValue = '', placeholder, submitting, buttonText = 'Submit' }) => {
    const [content, setContent] = useState(initialValue);
    const { t } = useTranslation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim()) return;
        onSubmit(content);
        setContent('');
    };

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 2 }}>
            <TextField
                fullWidth
                multiline
                rows={3}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={placeholder}
                disabled={submitting}
                sx={{ mb: 2 }}
            />
            <Button
                type="submit"
                variant="contained"
                disabled={submitting || !content.trim()}
            >
                {submitting ? t('Submitting...') : buttonText}
            </Button>
        </Box>
    );
};

const Comment = ({ comment, onReply, onLike, isAuthenticated }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const { t } = useTranslation();

    const handleReplySubmit = (content) => {
        onReply(comment.id, content);
        setShowReplyForm(false);
    };

    return (
        <Card sx={{ mb: 2 }}>
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                        src={comment.author.avatar_url}
                        alt={comment.author.full_name}
                        sx={{ mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1">
                            {comment.author.full_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {comment.time_since} {t('ago')}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton 
                            onClick={() => onLike(comment.id)}
                            disabled={!isAuthenticated}
                            size="small"
                        >
                            {comment.is_liked ? (
                                <FavoriteIcon color="error" fontSize="small" />
                            ) : (
                                <FavoriteBorderIcon fontSize="small" />
                            )}
                        </IconButton>
                        <Typography variant="caption" color="text.secondary">
                            {comment.like_count}
                        </Typography>
                        <IconButton 
                            onClick={() => setShowReplyForm(!showReplyForm)}
                            disabled={!isAuthenticated}
                            size="small"
                        >
                            <ReplyIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>
                <Typography variant="body2" sx={{ mb: 2 }}>{comment.content}</Typography>
                
                <Collapse in={showReplyForm}>
                    <Box sx={{ ml: 4, mb: 2 }}>
                        <CommentForm
                            onSubmit={handleReplySubmit}
                            placeholder={t('Write a reply...')}
                            buttonText={t('Reply')}
                        />
                    </Box>
                </Collapse>

                {/* Replies */}
                {comment.replies && comment.replies.map(reply => (
                    <Card key={reply.id} sx={{ ml: 4, mt: 2, bgcolor: 'action.hover' }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                <Avatar
                                    src={reply.author.avatar_url}
                                    alt={reply.author.full_name}
                                    sx={{ mr: 2, width: 24, height: 24 }}
                                />
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle2">
                                        {reply.author.full_name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {reply.time_since} {t('ago')}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <IconButton 
                                        onClick={() => onLike(reply.id)}
                                        disabled={!isAuthenticated}
                                        size="small"
                                    >
                                        {reply.is_liked ? (
                                            <FavoriteIcon color="error" fontSize="small" />
                                        ) : (
                                            <FavoriteBorderIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                    <Typography variant="caption" color="text.secondary">
                                        {reply.like_count}
                                    </Typography>
                                </Box>
                            </Box>
                            <Typography variant="body2">{reply.content}</Typography>
                        </CardContent>
                    </Card>
                ))}
            </CardContent>
        </Card>
    );
};

const PostDetail = () => {
    const { slug } = useParams();
    const { t, i18n } = useTranslation();
    const isRTL = i18n.language === 'fa';
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated);
    
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [shareAnchorEl, setShareAnchorEl] = useState(null);

    useEffect(() => {
        const fetchPost = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await blogService.getPost(slug);
                if (data) {
                    setPost(data);
                    await blogService.incrementViewCount(slug);
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPost();
        }
    }, [slug]);

    const sortedComments = useMemo(() => {
        if (!Array.isArray(post?.comments)) return [];
        return [...post.comments].sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
        );
    }, [post?.comments]);

    const handleCommentSubmit = async (content) => {
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const newComment = await blogService.createComment({
                post: post.id,
                content: content
            });
            setPost(prev => ({
                ...prev,
                comments: [newComment, ...(prev.comments || [])]
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentReply = async (commentId, content) => {
        if (!content.trim()) return;

        setSubmitting(true);
        try {
            const newReply = await blogService.replyToComment(commentId, {
                content: content
            });
            
            setPost(prev => ({
                ...prev,
                comments: prev.comments.map(comment => 
                    comment.id === commentId
                        ? { 
                            ...comment, 
                            replies: [...(comment.replies || []), newReply]
                        }
                        : comment
                )
            }));
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCommentLike = async (commentId) => {
        if (!isAuthenticated) return;
        
        try {
            await blogService.likeComment(commentId);
            setPost(prev => ({
                ...prev,
                comments: prev.comments.map(comment => {
                    if (comment.id === commentId) {
                        return {
                            ...comment,
                            is_liked: !comment.is_liked,
                            like_count: comment.is_liked ? comment.like_count - 1 : comment.like_count + 1
                        };
                    }
                    // Check in replies
                    if (comment.replies) {
                        const updatedReplies = comment.replies.map(reply => {
                            if (reply.id === commentId) {
                                return {
                                    ...reply,
                                    is_liked: !reply.is_liked,
                                    like_count: reply.is_liked ? reply.like_count - 1 : reply.like_count + 1
                                };
                            }
                            return reply;
                        });
                        return { ...comment, replies: updatedReplies };
                    }
                    return comment;
                })
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) return;
        try {
            await blogService.likePost(slug);
            setPost(prev => ({
                ...prev,
                is_liked: !prev.is_liked,
                like_count: prev.is_liked ? prev.like_count - 1 : prev.like_count + 1
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleBookmark = async () => {
        if (!isAuthenticated) return;
        try {
            await blogService.bookmarkPost(slug);
            setPost(prev => ({
                ...prev,
                is_bookmarked: !prev.is_bookmarked,
                bookmark_count: prev.is_bookmarked ? prev.bookmark_count - 1 : prev.bookmark_count + 1
            }));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleShareClick = (event) => {
        setShareAnchorEl(event.currentTarget);
    };

    const handleShareClose = () => {
        setShareAnchorEl(null);
    };

    const handleShare = async (platform) => {
        try {
            await blogService.sharePost(slug, platform);
            window.open(post.share_urls[platform], '_blank');
        } catch (err) {
            setError(err.message);
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
                <ErrorMessage error={error} onClose={() => setError(null)} />
            </Box>
        );
    }

    if (!post) {
        return (
            <Box sx={{ py: 4 }}>
                <Alert severity="info">{t('Post not found')}</Alert>
            </Box>
        );
    }

    return (
        <Box sx={{ py: 6, backgroundColor: 'background.default' }} dir={isRTL ? 'rtl' : 'ltr'}>
            <Container maxWidth="lg">
                {/* Featured Image */}
                <Box sx={{ position: 'relative', mb: 4, borderRadius: 2, overflow: 'hidden' }}>
                    <Box
                        component="img"
                        src={post.featured_image || '/images/default-blog.jpg'}
                        alt={post.title}
                        sx={{
                            width: '100%',
                            height: { xs: '300px', md: '500px' },
                            objectFit: 'cover',
                        }}
                    />
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                            p: 3,
                        }}
                    >
                        <Typography variant="h3" color="white" gutterBottom>
                            {post.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, color: 'white' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Avatar src={post.author.avatar_url} alt={post.author.full_name} />
                                <Typography>{post.author.full_name}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <AccessTimeIcon />
                                <Typography>{new Date(post.published_at).toLocaleDateString()}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VisibilityIcon />
                                <Typography>{post.views}</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Content */}
                <Grid container spacing={4}>
                    <Grid item xs={12} md={8}>
                        <Paper sx={{ p: 4, mb: 4, borderRadius: 2 }}>
                            {/* Categories and Tags */}
                            <Box sx={{ mb: 3 }}>
                                {post.categories && post.categories.map(category => (
                                    <Chip
                                        key={category.id}
                                        label={category.name}
                                        component={Link}
                                        to={`/blog?category=${category.slug}`}
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                ))}
                                {post.tags && post.tags.map(tag => (
                                    <Chip
                                        key={tag.id}
                                        label={tag.name}
                                        variant="outlined"
                                        component={Link}
                                        to={`/blog?tag=${tag.slug}`}
                                        sx={{ mr: 1, mb: 1 }}
                                    />
                                ))}
                            </Box>

                            {/* Post Content */}
                            <Typography variant="body1" sx={{ mb: 4 }}>
                                {post.content}
                            </Typography>

                            {/* Actions */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                                <Box sx={{ display: 'flex', gap: 2 }}>
                                    <IconButton onClick={handleLike} disabled={!isAuthenticated}>
                                        {post.is_liked ? (
                                            <FavoriteIcon color="error" />
                                        ) : (
                                            <FavoriteBorderIcon />
                                        )}
                                    </IconButton>
                                    <IconButton onClick={handleBookmark} disabled={!isAuthenticated}>
                                        {post.is_bookmarked ? (
                                            <BookmarkIcon color="primary" />
                                        ) : (
                                            <BookmarkBorderIcon />
                                        )}
                                    </IconButton>
                                    <IconButton onClick={handleShareClick}>
                                        <ShareIcon />
                                    </IconButton>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {post.like_count} {t('likes')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {post.bookmark_count} {t('bookmarks')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {post.comment_count} {t('comments')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Comments Section */}
                            <Divider sx={{ my: 4 }} />
                            <Typography variant="h5" gutterBottom>
                                {t('Comments')} ({sortedComments.length})
                            </Typography>

                            {isAuthenticated ? (
                                <CommentForm
                                    onSubmit={handleCommentSubmit}
                                    placeholder={t('Write a comment...')}
                                    submitting={submitting}
                                    buttonText={t('Submit')}
                                />
                            ) : (
                                <Alert severity="info" sx={{ mb: 4 }}>
                                    {t('Please')} <Link to="/login">{t('login')}</Link> {t('to comment')}
                                </Alert>
                            )}

                            {/* Comments List */}
                            {sortedComments.length > 0 ? (
                                sortedComments.map(comment => (
                                    <Comment
                                        key={comment.id}
                                        comment={comment}
                                        onReply={handleCommentReply}
                                        onLike={handleCommentLike}
                                        isAuthenticated={isAuthenticated}
                                    />
                                ))
                            ) : (
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    {t('No comments yet')}
                                </Typography>
                            )}
                        </Paper>
                    </Grid>

                    {/* Sidebar */}
                    <Grid item xs={12} md={4}>
                        {/* Related Posts */}
                        {post.related_posts && post.related_posts.length > 0 && (
                            <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
                                <Typography variant="h6" gutterBottom>
                                    {t('Related Posts')}
                                </Typography>
                                {post.related_posts.map(relatedPost => (
                                    <Card key={relatedPost.id} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Typography
                                                variant="subtitle1"
                                                component={Link}
                                                to={`/blog/${relatedPost.slug}`}
                                                sx={{ textDecoration: 'none', color: 'inherit' }}
                                            >
                                                {relatedPost.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {new Date(relatedPost.published_at).toLocaleDateString()}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Paper>
                        )}
                    </Grid>
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

export default PostDetail; 