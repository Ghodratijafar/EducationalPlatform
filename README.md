# پلتفرم آموزشی

این یک پلتفرم آموزشی آنلاین است که با استفاده از Django و React.js توسعه داده شده است.

## ویژگی‌ها

- سیستم مدیریت دوره‌های آموزشی
- سیستم مدیریت کاربران
- بخش وبلاگ
- دسته‌بندی محتوا
- رابط کاربری چند زبانه
- طراحی واکنش‌گرا

## پیش‌نیازها

- Python 3.8+
- Node.js 14+
- PostgreSQL (اختیاری - می‌توانید از SQLite نیز استفاده کنید)

## نصب و راه‌اندازی

### Backend

1. وارد دایرکتوری backend شوید:
```bash
cd backend
```

2. محیط مجازی Python را ایجاد و فعال کنید:
```bash
python -m venv venv
source venv/bin/activate  # در ویندوز: venv\Scripts\activate
```

3. وابستگی‌ها را نصب کنید:
```bash
pip install -r requirements.txt
```

4. دیتابیس را مهاجرت کنید:
```bash
python manage.py migrate
```

5. سرور توسعه را اجرا کنید:
```bash
python manage.py runserver
```

### Frontend

1. وارد دایرکتوری frontend شوید:
```bash
cd frontend
```

2. وابستگی‌ها را نصب کنید:
```bash
npm install
```

3. برنامه را در حالت توسعه اجرا کنید:
```bash
npm start
```

## ساختار پروژه

```
.
├── backend/
│   ├── backend/          # تنظیمات اصلی Django
│   ├── courses/          # اپلیکیشن دوره‌ها
│   ├── users/           # اپلیکیشن کاربران
│   ├── blog/            # اپلیکیشن وبلاگ
│   └── categories/      # اپلیکیشن دسته‌بندی‌ها
│
└── frontend/
    ├── public/
    └── src/
        ├── components/  # کامپوننت‌های React
        ├── services/    # سرویس‌های API
        ├── store/       # مدیریت state با Redux
        └── theme/       # تنظیمات ظاهری
```

## تکنولوژی‌های استفاده شده

### Backend
- Django 5.0.2
- Django REST Framework
- JWT Authentication
- PostgreSQL (اختیاری)
- Gunicorn (برای استقرار)

### Frontend
- React.js
- Material-UI (MUI)
- Redux
- i18next
- React Router
- Formik & Yup

## توسعه

برای مشارکت در توسعه این پروژه:

1. یک fork از مخزن ایجاد کنید
2. یک branch جدید برای ویژگی خود ایجاد کنید
3. تغییرات خود را commit کنید
4. به branch اصلی push کنید
5. یک Pull Request ایجاد کنید

## مجوز

این پروژه تحت مجوز MIT منتشر شده است.