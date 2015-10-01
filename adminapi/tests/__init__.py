import base64

from django.test import TestCase
from django.contrib.auth.models import User
from django.test import RequestFactory
from django.db import models
from django.core.urlresolvers import reverse

from rest_framework.test import APIRequestFactory, APIClient
from rest_framework.authtoken.models import Token

from adminapi.views import LoginView, TestView
from adminapi.tests.models import TestModel


class TrivialTest(TestCase):

    @classmethod
    def setUpClass(cls):
        cls.obj = TestModel()
        cls.obj.save()

    @classmethod
    def tearDownClass(cls):
        super(TrivialTest, cls).tearDownClass()

    def test_trivial_true(self):
        test_var = True
        self.assertEqual(test_var, True)

    def test_model_instantiation(self):
        self.assertIsNotNone(self.obj)

    def test_model_fields_success(self):
        self.obj.test_editable_field = 'Test chars'
        self.obj.save()
        self.assertEqual(self.obj.test_editable_field, 'Test chars')

    def test_model_fields_fail(self):
        self.obj.test_editable_field = 'Test chars'
        self.obj.save()
        self.assertNotEqual(self.obj.test_editable_field, 'Not correct')


class LoginTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpClass(cls):
        cls.user = User.objects.create_user(
            username='tester',
            email='tester@foo.com',
            password='test1pass',
        )
        cls.user.is_active = True
        cls.user.is_superuser = True
        cls.user.save()
        cls.token = Token.objects.create(user=cls.user)
        cls.token.save()
        cls.test_model = TestModel()
        super(LoginTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        super(LoginTest, cls).tearDownClass()

    def test_login_success(self):
        self.client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode('tester:test1pass')
        )
        response = self.client.post(
            '/login/'
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                'detail': 'Credentials Validated',
                'token': self.token.key,
                'username': self.user.username
            }
        )

    def test_login_fail(self):
        self.client.credentials(
            HTTP_AUTHORIZATION='Basic ' + base64.b64encode('wrong:creds')
        )
        response = self.client.post(
            '/login/'
        )
        self.assertEqual(response.status_code, 403)
        self.assertJSONEqual(
            response.content,
            {
                'detail': "Invalid username/password.",
            }
        )

    def test_token_auth_success(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(
            '/test/'
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                'detail': 'Auth Token Valid',
            }
        )

    def test_token_auth_fail(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + 'Wr0ngT0k3n')
        response = self.client.get(
            '/test/'
        )
        self.assertEqual(response.status_code, 401)
        self.assertJSONEqual(
            response.content,
            {
                'detail': 'Invalid token.',
            }
        )

    def test_model_data_creation_success(self):
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.post(
            reverse('generic-list'),
            {
                'test_editable_field': 'Test Chars',
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(
            response.content,
            {
                'id': 1,
                'test_editable_field': 'Test Chars',
                'test_non_editable_field': '',
            }
        )

    def test_model_data_retrieve_list_success(self):
        self.test_model.test_editable_field = 'Retrieve Test'
        self.test_model.save()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.get(
           reverse('generic-list'),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    'id': 1,
                    'test_editable_field': 'Retrieve Test',
                    'test_non_editable_field': '',
                }
            ]
        )

    def test_model_data_update_success(self):
        self.test_model.test_editable_field = 'Update Test'
        self.test_model.save()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.put(
            reverse('generic-detail', args=[1]),
            {
                'id': 1,
                'test_editable_field': 'Changed data',
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                'id': 1,
                'test_editable_field': 'Changed data',
                'test_non_editable_field': '',
            }
        )

    def test_model_data_delete_success(self):
        self.test_model.test_editable_field = 'Delete Test'
        self.test_model.save()
        self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
        response = self.client.delete(
            reverse('generic-detail', args=[1]),
        )
        self.assertEqual(response.status_code, 204)
