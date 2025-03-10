import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import {
    AppBar,
    Box,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    Container,
    Avatar,
    Button,
    Tooltip,
    MenuItem,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
} from '@mui/material';
import {
    Menu as MenuIcon,
    School as SchoolIcon,
    Person as PersonIcon,
    ExitToApp as LogoutIcon,
    Dashboard as DashboardIcon,
    Book as BookIcon,
    Assignment as AssignmentIcon,
    Article as BlogIcon,
} from '@mui/icons-material';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const isRTL = i18n.language === 'fa';

    const [anchorElUser, setAnchorElUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const menuItems = [
        { text: isRTL ? 'وبلاگ' : 'Blog', path: '/blog', icon: <BlogIcon /> },
        { text: isRTL ? 'تکالیف' : 'Assignments', path: '/assignments', icon: <AssignmentIcon /> },
        { text: isRTL ? 'دوره‌ها' : 'Courses', path: '/courses', icon: <BookIcon /> },
        { text: isRTL ? 'خانه' : 'Home', path: '/', icon: <DashboardIcon /> },
    ];

    const drawer = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: isRTL ? 'right' : 'left' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                {isRTL ? 'پلتفرم آموزشی' : 'Educational Platform'}
            </Typography>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => navigate(item.path)}
                        sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                    >
                        <ListItemIcon sx={{ minWidth: 'auto', mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }}>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky">
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                    {/* Logo and Brand */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        order: isRTL ? 2 : 0
                    }}>
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge={isRTL ? "end" : "start"}
                            onClick={handleDrawerToggle}
                            sx={{ display: { sm: 'none' } }}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            flexDirection: isRTL ? 'row-reverse' : 'row'
                        }}>
                            <Typography variant="h6" sx={{ color: 'white', display: { xs: 'none', sm: 'block' } }}>
                                {isRTL ? 'پلتفرم آموزشی' : 'Educational Platform'}
                            </Typography>
                            <SchoolIcon />
                        </Box>
                    </Box>

                    {/* Main Menu */}
                    <Box sx={{ 
                        display: { xs: 'none', md: 'flex' }, 
                        gap: 2,
                        flexDirection: isRTL ? 'row-reverse' : 'row',
                        order: 1
                    }}>
                        {menuItems.map((item) => (
                            <Button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                sx={{ 
                                    color: 'white',
                                    flexDirection: isRTL ? 'row-reverse' : 'row'
                                }}
                                startIcon={!isRTL && item.icon}
                                endIcon={isRTL && item.icon}
                            >
                                {item.text}
                            </Button>
                        ))}
                    </Box>

                    {/* Auth/Profile Section */}
                    <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: 1,
                        order: isRTL ? 0 : 2
                    }}>
                        {!isAuthenticated && (
                            <Box sx={{ 
                                display: 'flex', 
                                gap: 1,
                                flexDirection: isRTL ? 'row-reverse' : 'row'
                            }}>
                                <Button
                                    color="inherit"
                                    onClick={() => navigate('/login')}
                                    startIcon={!isRTL && <PersonIcon />}
                                    endIcon={isRTL && <PersonIcon />}
                                >
                                    {isRTL ? 'ورود' : 'Login'}
                                </Button>
                                <Button
                                    color="inherit"
                                    variant="outlined"
                                    onClick={() => navigate('/register')}
                                >
                                    {isRTL ? 'ثبت‌نام' : 'Register'}
                                </Button>
                            </Box>
                        )}

                        {isAuthenticated && (
                            <Box sx={{ flexGrow: 0 }}>
                                <Tooltip title={isRTL ? 'تنظیمات' : 'Open Settings'}>
                                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                                        <Avatar alt={user?.username}>
                                            {user?.username?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    </IconButton>
                                </Tooltip>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{
                                        vertical: 'top',
                                        horizontal: isRTL ? 'left' : 'right',
                                    }}
                                    keepMounted
                                    transformOrigin={{
                                        vertical: 'top',
                                        horizontal: isRTL ? 'left' : 'right',
                                    }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem onClick={() => navigate('/profile')} sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }}>
                                            <PersonIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography textAlign="center">
                                            {isRTL ? 'پروفایل' : 'Profile'}
                                        </Typography>
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout} sx={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}>
                                        <ListItemIcon sx={{ minWidth: 'auto', mr: isRTL ? 0 : 2, ml: isRTL ? 2 : 0 }}>
                                            <LogoutIcon fontSize="small" />
                                        </ListItemIcon>
                                        <Typography textAlign="center">
                                            {isRTL ? 'خروج' : 'Logout'}
                                        </Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        )}
                    </Box>
                </Toolbar>
            </Container>

            <Drawer
                variant="temporary"
                anchor={isRTL ? "right" : "left"}
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true,
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
};

export default Navbar; 