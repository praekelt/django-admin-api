

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
    }
}

INSTALLED_APPS = (
    'adminapi',
)

# xxx: get tests to pass with migrations
SOUTH_TESTS_MIGRATE = False
