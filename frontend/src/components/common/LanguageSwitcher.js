import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ButtonGroup, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButtonGroup = styled(ButtonGroup)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.fab,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,
  '& .MuiButton-root': {
    padding: theme.spacing(1, 2),
    minWidth: 80,
  },
}));

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = i18n.dir(lng);
    document.documentElement.lang = lng;
  };

  return (
    <Box>
      <StyledButtonGroup variant="contained" aria-label="language switcher">
        <Button
          onClick={() => changeLanguage('fa')}
          variant={i18n.language === 'fa' ? 'contained' : 'outlined'}
        >
          فارسی
        </Button>
        <Button
          onClick={() => changeLanguage('en')}
          variant={i18n.language === 'en' ? 'contained' : 'outlined'}
        >
          English
        </Button>
      </StyledButtonGroup>
    </Box>
  );
};

export default LanguageSwitcher; 