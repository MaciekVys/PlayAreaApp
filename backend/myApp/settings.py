import os
from pathlib import Path
from datetime import timedelta

BASE_DIR = Path(__file__).resolve().parent.parent




# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/3.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-(2vd$qzibw2&_3bli^#ecy!xa5wlvkg08*4=8avfn#)(f5q*c='

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = ['playarea-hky7.onrender.com', 'localhost','127.0.0.1']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'core',
    "graphene_django",
    "graphql_jwt.refresh_token.apps.RefreshTokenConfig",
    'graphql_jwt',
    "graphql_auth",
    "django_filters",
    'corsheaders',
    'graphene_file_upload',
]


MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
    "core.middleware.RefreshTokenMiddleware",
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Dodaj to middleware

    # 'graphene_file_upload.django.FileUploadMiddleware',

]


ROOT_URLCONF = 'myApp.urls'

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')


TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'myApp.wsgi.application'


CORS_ALLOW_CREDENTIALS = True
SESSION_COOKIE_SECURE = False
CSRF_COOKIE_SECURE = False

CORS_ORIGIN_WHITELIST = [
    "http://localhost:3000",
]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "https://playarea-hky7.onrender.com",
    "https://playarea-dumw.onrender.com",

]

SESSION_COOKIE_SAMESITE = 'Lax'
HTTP_ONLY = True
SESSION_COOKIE_NAME = "admin_sessionid"

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# W trybie produkcyjnym
if not DEBUG:
    # Zabezpieczenie przed CSRF
    CSRF_COOKIE_SECURE = True
    CSRF_COOKIE_HTTPONLY = True
    CSRF_COOKIE_SAMESITE = 'Strict'

    # Zabezpieczenie przed sesjami na niezabezpieczonym połączeniu
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Strict'

    # Używanie HTTPS w produkcji
    SECURE_SSL_REDIRECT = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True



STATIC_URL = '/static/'

# Ustawienia w produkcji dla zbierania plików statycznych

STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# Dodajemy miejsce, gdzie pliki statyczne aplikacji będą trzymane
STATICFILES_DIRS = [
    BASE_DIR / "static",  # Zbiera pliki statyczne z katalogu 'static' w głównym katalogu projektu
]


DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'core.ExtendUser'

GRAPHENE = {
    "SCHEMA": "core.schema.schema",
    "MIDDLEWARE": [
        "graphql_jwt.middleware.JSONWebTokenMiddleware",
    ],
}


AUTHENTICATION_BACKENDS = [
    "graphql_auth.backends.GraphQLAuthBackend",
    "django.contrib.auth.backends.ModelBackend",
    'graphql_jwt.backends.JSONWebTokenBackend',
]



GRAPHQL_AUTH = {
    'ACTIVATION_PATH_ON_EMAIL': '/activate/',
    'EMAIL_TEMPLATE_ACTIVATION': 'activation_email.html',
    'SITE_URL': os.getenv('SITE_URL', 'https://playarea-hky7.onrender.com'),
}


GRAPHQL_JWT = {
    "JWT_ALLOW_ANY_CLASSES": [
        "graphql_auth.mutations.Register",
        "graphql_auth.mutations.VerifyAccount",
        "graphql_auth.mutations.ObtainJSONWebToken",
    ],
    "JWT_VERIFY_EXPIRATION": True,
    "JWT_ALLOW_REFRESH": True,
    "JWT_LONG_RUNNING_REFRESH_TOKEN": True,
    "JWT_AUTH_TOKEN_EXPIRATION_DELTA": timedelta(minutes=5),
    "JWT_REFRESH_TOKEN_EXPIRATION_DELTA": timedelta(days=7),
    "JWT_COOKIE":False,
    "JWT_REFRESH_TOKEN_COOKIE": False,
    "JWT_COOKIE_NAME": "JWT",
    "JWT_REFRESH_TOKEN_COOKIE_NAME": "JWT-Refresh-token",
}

EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_HOST_USER = 'playarea.football@gmail.com'
EMAIL_HOST_PASSWORD = 'cacx olzc wwrx nzzk'
DEFAULT_FROM_EMAIL = 'Play Area <playarea.football@gmail.com>'
EMAIL_USE_TLS = True
EMAIL_USE_SSL = False

CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
