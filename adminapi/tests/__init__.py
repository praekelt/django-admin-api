from django.test import TestCase
from django.contrib.auth.models import User
from django.test import RequestFactory


class TrivialTest(TestCase):

    def trivial_true_test(self):
            test_var = True
            self.assertEqual(test_var, True)


class LoginTest(TestCase):

    def setup(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(
            username='tester',
            email='tester@foo.com', password='test1pass'
        )

    def login_success(self):
        request = self.factory.post(
            '/login-auth/',
            {'Authorization': 'tester:test1pss'}
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response_content,
            {'detail': 'Credentials Validated'}
        )

    def login_fail(self):
        request = self.factory.post(
            '/login-auth/',
            {'Authorization': 'null:empty'}
        )
        self.assertEqual(response.status_code, 403)
        self.assertJSONEqual(
            response_content,
            {'detail': 'Invalid username/password.'}
        )
