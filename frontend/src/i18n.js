import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      common: {
        save: 'Save',
        cancel: 'Cancel',
        edit: 'Edit',
        delete: 'Delete',
        share: 'Share',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        submit: 'Submit',
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        forgotPassword: 'Forgot Password?',
        rememberMe: 'Remember Me',
      },
      courses: {
        title: 'Available Courses',
        subtitle: 'Explore our wide range of courses',
        search: 'Search courses...',
        sort: {
          newest: 'Newest',
          priceLow: 'Price: Low to High',
          priceHigh: 'Price: High to Low',
          rating: 'Highest Rated'
        },
        level: {
          all: 'All Levels',
          beginner: 'Beginner',
          intermediate: 'Intermediate',
          advanced: 'Advanced'
        },
        free: 'Free',
        currency: 'USD',
        viewDetails: 'View Details',
        continueLearning: 'Continue Learning',
        enrolled: 'Enrolled',
        ratings: 'ratings',
        minutes: 'minutes',
        defaultDuration: '8 weeks',
        uncategorized: 'Uncategorized',
        unknownInstructor: 'Unknown Instructor',
        noResults: 'No courses found matching your criteria',
        about: 'About This Course',
        objectives: 'What You Will Learn',
        curriculum: 'Course Content',
        includes: 'This Course Includes',
        hoursContent: 'hours of content',
        assignments: 'Assignments',
        certificate: 'Certificate of Completion',
        instructor: 'Instructor',
        lastUpdated: 'Last Updated'
      },
      lessons: {
        title: 'Lesson',
        next: 'Next Lesson',
        previous: 'Previous Lesson',
        complete: 'Mark as Complete',
        completed: 'Completed',
        notes: 'Notes',
        addNote: 'Add a note...',
        saveNote: 'Save Note',
        shareNote: 'Share Note',
        shareNoteConfirm: 'Are you sure you want to share this note with other students?',
        errorAddingNote: 'Error adding note',
        errorEditingNote: 'Error editing note',
        errorDeletingNote: 'Error deleting note',
        errorSharingNote: 'Error sharing note',
        errorExportingNotes: 'Error exporting notes',
        errorPlayingVideo: 'Error playing video',
        courseContent: 'Course Content',
      },
      profile: {
        title: 'Profile',
        edit: 'Edit Profile',
        save: 'Save Changes',
        avatar: 'Profile Picture',
        name: 'Full Name',
        bio: 'Bio',
        language: 'Language',
        theme: 'Theme',
        notifications: 'Notifications',
      },
      navigation: {
        home: 'Home',
        courses: 'Courses',
        blog: 'Blog',
        about: 'About',
        contact: 'Contact',
        profile: 'Profile',
        dashboard: 'Dashboard',
      },
    },
  },
  fa: {
    translation: {
      common: {
        save: 'ذخیره',
        cancel: 'انصراف',
        edit: 'ویرایش',
        delete: 'حذف',
        share: 'اشتراک‌گذاری',
        loading: 'در حال بارگذاری...',
        error: 'خطا',
        success: 'موفقیت',
        submit: 'ارسال',
      },
      auth: {
        login: 'ورود',
        register: 'ثبت‌نام',
        logout: 'خروج',
        email: 'ایمیل',
        password: 'رمز عبور',
        confirmPassword: 'تکرار رمز عبور',
        forgotPassword: 'رمز عبور را فراموش کرده‌اید؟',
        rememberMe: 'مرا به خاطر بسپار',
      },
      courses: {
        title: 'دوره‌های موجود',
        subtitle: 'مجموعه دوره‌های آموزشی ما را کاوش کنید',
        search: 'جستجوی دوره‌ها...',
        sort: {
          newest: 'جدیدترین',
          priceLow: 'قیمت: کم به زیاد',
          priceHigh: 'قیمت: زیاد به کم',
          rating: 'بالاترین امتیاز'
        },
        level: {
          all: 'همه سطوح',
          beginner: 'مبتدی',
          intermediate: 'متوسط',
          advanced: 'پیشرفته'
        },
        free: 'رایگان',
        currency: 'تومان',
        viewDetails: 'مشاهده جزئیات',
        continueLearning: 'ادامه یادگیری',
        enrolled: 'ثبت‌نام شده',
        ratings: 'نظر',
        minutes: 'دقیقه',
        defaultDuration: '۸ هفته',
        uncategorized: 'دسته‌بندی نشده',
        unknownInstructor: 'مدرس ناشناس',
        noResults: 'هیچ دوره‌ای با معیارهای جستجوی شما یافت نشد',
        about: 'درباره این دوره',
        objectives: 'چه چیزهایی یاد خواهید گرفت',
        curriculum: 'محتوای دوره',
        includes: 'این دوره شامل',
        hoursContent: 'ساعت محتوا',
        assignments: 'تمرین‌ها',
        certificate: 'گواهی پایان دوره',
        instructor: 'مدرس',
        lastUpdated: 'آخرین بروزرسانی'
      },
      lessons: {
        title: 'درس',
        next: 'درس بعدی',
        previous: 'درس قبلی',
        complete: 'علامت‌گذاری به عنوان تکمیل شده',
        completed: 'تکمیل شده',
        notes: 'یادداشت‌ها',
        addNote: 'افزودن یادداشت...',
        saveNote: 'ذخیره یادداشت',
        shareNote: 'اشتراک‌گذاری یادداشت',
        shareNoteConfirm: 'آیا مطمئن هستید که می‌خواهید این یادداشت را با سایر دانشجویان به اشتراک بگذارید؟',
        errorAddingNote: 'خطا در افزودن یادداشت',
        errorEditingNote: 'خطا در ویرایش یادداشت',
        errorDeletingNote: 'خطا در حذف یادداشت',
        errorSharingNote: 'خطا در اشتراک‌گذاری یادداشت',
        errorExportingNotes: 'خطا در خروجی گرفتن از یادداشت‌ها',
        errorPlayingVideo: 'خطا در پخش ویدیو',
        courseContent: 'محتوای دوره',
      },
      profile: {
        title: 'پروفایل',
        edit: 'ویرایش پروفایل',
        save: 'ذخیره تغییرات',
        avatar: 'تصویر پروفایل',
        name: 'نام کامل',
        bio: 'درباره من',
        language: 'زبان',
        theme: 'تم',
        notifications: 'اعلان‌ها',
      },
      navigation: {
        home: 'خانه',
        courses: 'دوره‌ها',
        blog: 'وبلاگ',
        about: 'درباره ما',
        contact: 'تماس با ما',
        profile: 'پروفایل',
        dashboard: 'داشبورد',
      },
    },
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fa',
    supportedLngs: ['en', 'fa'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

document.documentElement.dir = i18n.dir();
document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (lng) => {
  document.documentElement.dir = i18n.dir(lng);
  document.documentElement.lang = lng;
});

export default i18n; 