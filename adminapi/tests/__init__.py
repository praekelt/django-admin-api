import base64, pdb, logging

from django.test import TestCase
from django.contrib.auth.models import User
from django.test import RequestFactory
from django.db import models
from django.core.urlresolvers import reverse

from rest_framework.test import APIRequestFactory, APIClient
from rest_framework.authtoken.models import Token

from adminapi.tests import models


class TrivialTest(TestCase):

    @classmethod
    def setUpClass(cls):
        cls.obj = models.TestModel()
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
        self.obj.test_editable_field = "Test chars"
        self.obj.save()
        self.assertEqual(self.obj.test_editable_field, "Test chars")

    def test_model_fields_fail(self):
        self.obj.test_editable_field = "Test chars"
        self.obj.save()
        self.assertNotEqual(self.obj.test_editable_field, "Not correct")


class LoginTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpClass(cls):
        cls.user = User.objects.create_user(
            username="tester",
            email="tester@foo.com",
            password="test1pass",
        )
        cls.user.is_active = True
        cls.user.is_superuser = True
        cls.user.save()
        cls.token = Token.objects.create(user=cls.user)
        cls.token.save()
        cls.test_model = models.TestModel()
        super(LoginTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        super(LoginTest, cls).tearDownClass()

    def test_login_success(self):
        self.client.credentials(
            HTTP_AUTHORIZATION="Basic " + base64.b64encode("tester:test1pass")
        )
        response = self.client.post(
            reverse("login")
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Credentials Validated",
                "token": self.token.key,
                "username": self.user.username
            }
        )

    def test_login_fail(self):
        self.client.credentials(
            HTTP_AUTHORIZATION="Basic " + base64.b64encode("wrong:creds")
        )
        response = self.client.post(
            reverse("login"),
        )
        self.assertEqual(response.status_code, 401)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Invalid username/password.",
            }
        )

    def test_token_auth_success(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.get(
            reverse("test"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Auth Token Valid",
            }
        )

    def test_token_auth_fail(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + "Wr0ngT0k3n")
        response = self.client.get(
            reverse("test")
        )
        self.assertEqual(response.status_code, 401)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Invalid token.",
            }
        )

    def test_model_data_creation_success(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.post(
            reverse("generic-list"),
            {
                "test_editable_field": "Test Chars",
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(
            response.content,
            {
                "id": 1,
                "test_editable_field": "Test Chars",
                "test_non_editable_field": "",
            }
        )

    def test_model_data_retrieve_list_success(self):
        self.test_model.test_editable_field = "Retrieve Test"
        self.test_model.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.get(
           reverse("generic-list"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "test_editable_field": "Retrieve Test",
                    "test_non_editable_field": "",
                }
            ]
        )

    def test_model_data_update_success(self):
        self.test_model.test_editable_field = "Update Test"
        self.test_model.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.put(
            reverse("generic-detail", args=[1]),
            {
                "id": 1,
                "test_editable_field": "Changed data",
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 1,
                "test_editable_field": "Changed data",
                "test_non_editable_field": "",
            }
        )

    def test_model_data_delete_success(self):
        self.test_model.test_editable_field = "Delete Test"
        self.test_model.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.delete(
            reverse("generic-detail", args=[1]),
        )
        self.assertEqual(response.status_code, 204)


class CRUDUsersTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpClass(cls):
        cls.user = User.objects.create_user(
            username="Super",
            email="tester@foo.com",
            password="test1pass",
        )
        cls.user.is_active = True
        cls.user.is_superuser = True
        cls.user.is_staff = True
        cls.user.save()
        cls.token = Token.objects.create(user=cls.user)
        cls.token.save()
        super(CRUDUsersTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        super(CRUDUsersTest, cls).tearDownClass()

    def test_access_success(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.get(
            reverse("users-list")
        )
        self.assertEqual(response.status_code, 200)

    def test_access_denied(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + "Wr0ngT0k3n")
        response = self.client.get(
            reverse("users-list")
        )
        self.assertEqual(response.status_code, 401)

    def test_users_data_retrieve_list_success(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="new@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.get(
           reverse("users-list"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "username": "Super",
                    "first_name": "",
                    "last_name": "",
                    "email": "tester@foo.com"
                },
                {
                    "id": 2,
                    "username": "returnTestUser",
                    "first_name": "first",
                    "last_name": "last",
                    "email": "new@foo.com"
                }
            ]
        )

    def test_users_data_retrieve_list_denied(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="tester@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.token = Token.objects.create(user=self.user)
        self.token.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.get(
           reverse("users-list"),
        )
        self.assertEqual(response.status_code, 403)

    def test_users_data_retrieve_user_success(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="tester@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.get(
           reverse("users-detail", args=[2]),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 2,
                "username": "returnTestUser",
                "first_name": "first",
                "last_name": "last",
                "email": "tester@foo.com"
            }
        )

    def test_user_data_creation_success(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.post(
            reverse("users-list"),
            {
                "username": "APIUser",
                "password": "APIpass",
                "first_name": "John",
                "last_name": "Deer",
                "email": "api@restfull.django"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 2,
                "username": "APIUser",
                "first_name": "John",
                "last_name": "Deer",
                "email": "api@restfull.django"
            }
        )

    def test_user_data_creation_denied(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="tester@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.token = Token.objects.create(user=self.user)
        self.token.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.post(
            reverse("users-list"),
            {
                "username": "APIUser",
                "password": "APIpass",
                "first_name": "John",
                "last_name": "Deer",
                "email": "api@restfull.django"
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_user_data_delete_success(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="tester@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.delete(
            reverse("users-detail", args=[2])
        )
        self.assertEqual(response.status_code, 204)
        response = self.client.get(
            reverse("users-list"),
        )
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "username": "Super",
                    "first_name": "",
                    "last_name": "",
                    "email": "tester@foo.com"
                }
            ]
        )

    def test_user_data_update_success(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="tester@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.put(
            reverse("users-detail", args=[2]),
            {
                "username": "APIUser",
                "password": "APIpass",
                "first_name": "John",
                "last_name": "Deer",
                "email": "api@restfull.django"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 2,
                "username": "APIUser",
                "first_name": "John",
                "last_name": "Deer",
                "email": "api@restfull.django"
            }
        )

    def test_user_data_update_denied(self):
        self.user = User.objects.create_user(
            username="returnTestUser",
            first_name="first",
            last_name="last",
            email="tester@foo.com",
            password="password",
        )
        self.user.is_active = True
        self.user.save()
        self.token = Token.objects.create(user=self.user)
        self.token.save()
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.put(
            reverse("users-detail", args=[2]),
            {
                "username": "APIUser",
                "password": "APIpass",
                "first_name": "John",
                "last_name": "Deer",
                "email": "api@restfull.django"
            }
        )
        self.assertEqual(response.status_code, 403)

    def test_user_data_creation_field_error_responses(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.post(
            reverse("users-list"),
            {
            }
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "username": ["This field is required."],
                "password": ["This field is required."]
            }
        )
        response = self.client.post(
            reverse("users-list"),
            {
                "username": "Super"
            }
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "username": ["This field must be unique."],
                "password": ["This field is required."]
            }
        )
        response = self.client.post(
            reverse("users-list"),
            {
                "username": "Super",
                "password": "test"
            }
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "username": ["This field must be unique."]
            }
        )

    def test_user_data_update_field_error_responses(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + self.token.key)
        response = self.client.put(
            reverse("users-detail", args=[1]),
            {
            }
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "username": ["This field is required."]
            }
        )
        response = self.client.post(
            reverse("users-list"),
            {
                "username": "Super"
            }
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "username": ["This field must be unique."],
                "password": ["This field is required."]
            }
        )


class ForeignKeyModelsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpClass(cls):
        cls.foreign_single_relation = models.ForeignSingleRelation()
        cls.foreign_single_relation.title = "ForeignRelation 1"
        cls.foreign_single_relation.save()

        cls.foreign_key_test_model_1 = models.ForeignKeyTestModel()
        cls.foreign_key_test_model_1.title = "TestModel 1"
        cls.foreign_key_test_model_1.foreign_single_relation = \
            cls.foreign_single_relation
        cls.foreign_key_test_model_1.save()
        cls.foreign_key_test_model_2 = models.ForeignKeyTestModel()
        cls.foreign_key_test_model_2.title = "TestModel 2"
        cls.foreign_key_test_model_2.foreign_single_relation = \
            cls.foreign_single_relation
        cls.foreign_key_test_model_2.save()

        cls.foreign_many_relation_1 = models.ForeignManyRelation()
        cls.foreign_many_relation_1.title = "ForeignManyRelation 1"
        cls.foreign_many_relation_1.save()
        cls.foreign_many_relation_1.foreign_key_test_models.add(
            cls.foreign_key_test_model_1,
            cls.foreign_key_test_model_2
        )
        cls.foreign_many_relation_2 = models.ForeignManyRelation()
        cls.foreign_many_relation_2.title = "ForeignManyRelation 2"
        cls.foreign_many_relation_2.save()
        cls.foreign_many_relation_2.foreign_key_test_models.add(
            cls.foreign_key_test_model_1,
        )

    @classmethod
    def tearDownClass(cls):
        super(ForeignKeyModelsTest, cls).tearDownClass()

    def test_model_instantiation(self):
        self.assertIsNotNone(self.foreign_single_relation)
        self.assertIsNotNone(self.foreign_key_test_model_1)
        self.assertIsNotNone(self.foreign_key_test_model_2)
        self.assertIsNotNone(self.foreign_many_relation_1)
        self.assertIsNotNone(self.foreign_many_relation_2)

    def test_model_fields_success(self):
        self.assertEqual(
            self.foreign_single_relation.title,
            "ForeignRelation 1"
        )

        self.assertEqual(self.foreign_key_test_model_1.title, "TestModel 1")
        self.assertEqual(
            self.foreign_key_test_model_1.foreign_single_relation,
            self.foreign_single_relation
        )
        self.assertEqual(
            self.foreign_key_test_model_1.foreign_single_relation.title,
            "ForeignRelation 1"
        )
        self.assertEqual(
            self.foreign_key_test_model_1.many_relations.values("title"),
            [
                {"title": "ForeignManyRelation 1"},
                {"title": "ForeignManyRelation 2"}
            ]
        )
        self.assertEqual(self.foreign_key_test_model_2.title, "TestModel 2")
        self.assertEqual(
            self.foreign_key_test_model_2.foreign_single_relation,
            self.foreign_single_relation
        )
        self.assertEqual(
            self.foreign_key_test_model_2.foreign_single_relation.title,
            "ForeignRelation 1"
        )

    def test_model_fields_fail(self):
        self.assertNotEqual(self.foreign_single_relation.title, "Not correct")
        self.assertNotEqual(
            self.foreign_key_test_model_1.title,
            "Not correct 1"
        )
        self.assertNotEqual(
            self.foreign_key_test_model_2.title,
            "Not correct 2"
        )

    def test_foreign_key_model_api_response_success(self):
        response = self.client.get(
            reverse("foreign-keys-list"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "foreign_single_relation": 1,
                    "id": 1,
                    "title": "TestModel 1"
                },
                {
                    "foreign_single_relation": 1,
                    "id": 2,
                    "title": "TestModel 2"
                }
            ]
        )

    def test_foreign_key_model_api_create_success(self):
        response = self.client.post(
            reverse("foreign-keys-list"),
            {
                "title": "post_Model",
                "foreign_single_relation": 1
            }

        )
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(
            response.content,
            {
                "foreign_single_relation": 1,
                "id": 3,
                "title": "post_Model"
            },
        )

    def test_foreign_key_model_api_fetch_detail_success(self):
        response = self.client.get(
            reverse("foreign-keys-detail", args=[1])
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "foreign_single_relation": 1,
                "id": 1,
                "title": "TestModel 1"
            }
        )

    def test_foreign_key_model_api_update_success(self):
        self.foreign_single_relation = models.ForeignSingleRelation()
        self.foreign_single_relation.title = "ForeignRelation 2"
        self.foreign_single_relation.save()
        response = self.client.put(
            reverse("foreign-keys-detail", args=[1]),
            {
                "title": "Model 1 updated",
                "foreign_single_relation": 2
            }

        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "foreign_single_relation": 2,
                "id": 1,
                "title": "Model 1 updated"
            },
        )

    def test_foreign_key_model_api_delete_success(self):
        response = self.client.delete(
            reverse("foreign-keys-detail", args=[1]),
        )
        self.assertEqual(response.status_code, 204)
        response = self.client.get(
            reverse("foreign-keys-list"),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "foreign_single_relation": 1,
                    "id": 2,
                    "title": "TestModel 2"
                }
            ]
        )
