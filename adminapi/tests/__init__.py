import base64

from django.test import TestCase
from django.db import models
from django.contrib.auth.models import User
from django.test import RequestFactory
from django.core.urlresolvers import reverse

from rest_framework.test import APIRequestFactory, APIClient
from rest_framework.authtoken.models import Token


class Manufacturer(models.Model):
    title = models.CharField(max_length=100)

models.register_models("tests", Manufacturer)


class Car(models.Model):
    title = models.CharField(max_length=100)
    # Many to one relations
    manufacturer = models.ForeignKey(Manufacturer)

models.register_models("tests", Car)


class EngineSize(models.Model):
    title = models.CharField(max_length=100)
    # Many to many relations
    car = models.ManyToManyField(
        Car,
        related_name="engine_size"
    )

    def __unicode__(self):
        return self.title
models.register_models("tests", EngineSize)


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
        super(LoginTest, cls).setUpClass()

    @classmethod
    def tearDownClass(cls):
        super(LoginTest, cls).tearDownClass()

    def test_login_success(self):
        self.client.credentials(
            HTTP_AUTHORIZATION="Basic " + base64.b64encode("tester:test1pass")
        )
        response = self.client.post(
            reverse("api:login")
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
           reverse("api:login")
        )
        self.assertEqual(response.status_code, 401)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Invalid username/password.",
            }
        )


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
            reverse("api:users-list")
        )
        self.assertEqual(response.status_code, 200)

    def test_access_denied(self):
        self.client.credentials(HTTP_AUTHORIZATION="Token " + "Wr0ngT0k3n")
        response = self.client.get(
            reverse("api:users-list")
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
           reverse("api:users-list"),
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
           reverse("api:users-list"),
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
           reverse("api:users-detail", args=[2]),
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
            reverse("api:users-list"),
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
            reverse("api:users-list"),
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
            reverse("api:users-detail", args=[2])
        )
        self.assertEqual(response.status_code, 204)
        response = self.client.get(
            reverse("api:users-list"),
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
            reverse("api:users-detail", args=[2]),
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
            reverse("api:users-detail", args=[2]),
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
            reverse("api:users-list"),
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
            reverse("api:users-list"),
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
            reverse("api:users-list"),
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
            reverse("api:users-detail", args=[1]),
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
            reverse("api:users-list"),
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
        cls.manufacturer = Manufacturer()
        cls.manufacturer.title = "BMW"
        cls.manufacturer.save()

        cls.car_1 = Car()
        cls.car_1.title = "TestModel 1"
        cls.car_1.manufacturer = \
            cls.manufacturer
        cls.car_1.save()
        cls.car_2 = Car()
        cls.car_2.title = "TestModel 2"
        cls.car_2.manufacturer = \
            cls.manufacturer
        cls.car_2.save()

        cls.engine_size_1 = EngineSize()
        cls.engine_size_1.title = "EngineSize 1"
        cls.engine_size_1.save()
        cls.engine_size_1.car.add(
            cls.car_1,
            cls.car_2
        )
        cls.engine_size_1.save()
        cls.engine_size_2 = EngineSize()
        cls.engine_size_2.title = "EngineSize 2"
        cls.engine_size_2.save()
        cls.engine_size_2.car.add(
            cls.car_1,
        )
        cls.engine_size_2.save()

    @classmethod
    def tearDownClass(cls):
        super(ForeignKeyModelsTest, cls).tearDownClass()

    def test_model_instantiation(self):
        self.assertIsNotNone(self.manufacturer)
        self.assertIsNotNone(self.car_1)
        self.assertIsNotNone(self.car_2)
        self.assertIsNotNone(self.engine_size_1)
        self.assertIsNotNone(self.engine_size_2)

    def test_model_fields_success(self):
        self.assertEqual(
            self.manufacturer.title,
            "BMW"
        )

        self.assertEqual(self.car_1.title, "TestModel 1")
        self.assertEqual(
            self.car_1.manufacturer,
            self.manufacturer
        )
        self.assertEqual(
            self.car_1.manufacturer.title,
            "BMW"
        )
        self.assertEqual(
            list(
                self.car_1.engine_size.values_list(
                    'title',
                    flat=True
                )
            ),
            [u'EngineSize 1', u'EngineSize 2']
        )
        self.assertEqual(self.car_2.title, "TestModel 2")
        self.assertEqual(
            self.car_2.manufacturer,
            self.manufacturer
        )
        self.assertEqual(
            self.car_2.manufacturer.title,
            "BMW"
        )

    def test_model_fields_fail(self):
        self.assertNotEqual(self.manufacturer.title, "Not correct")
        self.assertNotEqual(
            self.car_1.title,
            "Not correct 1"
        )
        self.assertNotEqual(
            self.car_2.title,
            "Not correct 2"
        )

    def test_foreign_key_model_api_response_success(self):
        # TODO
        response = self.client.get(
            reverse("foreign-keys-list"),
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "CarSerializer"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "engine_size":
                        [
                            {
                                "id": 1,
                                "title": "EngineSize 1"
                            },
                            {
                                "id": 2,
                                "title": "EngineSize 2"
                            }
                        ],
                    "title": "TestModel 1",
                    "manufacturer": 1
                },
                {
                    "id": 2,
                    "engine_size":
                        [
                            {
                                "id": 1,
                                "title": "EngineSize 1"
                            }
                        ],
                    "title": "TestModel 2",
                    "manufacturer": 1
                }
            ]
        )

    def test_foreign_key_model_api_create_success(self):
        response = self.client.post(
            reverse("foreign-keys-list"),
            {
                "title": "post_Model",
                "manufacturer": 1
            },
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "CarSerializer"
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(
            response.content,
            {
                "manufacturer": 1,
                "engine_size": [],
                "id": 3,
                "title": "post_Model"
            },
        )

    def test_foreign_key_model_api_fetch_detail_success(self):
        response = self.client.get(
            reverse("foreign-keys-detail", args=[1]),
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "CarSerializer"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 1,
                "engine_size":
                    [
                        {
                            "id": 1,
                            "title": "EngineSize 1"
                        },
                        {
                            "id": 2,
                            "title": "EngineSize 2"
                        }
                    ],
                "title": "TestModel 1",
                "manufacturer": 1
            }
        )

    def test_foreign_key_model_api_update_success(self):
        self.manufacturer = Manufacturer()
        self.manufacturer.title = "ForeignRelation 2"
        self.manufacturer.save()
        response = self.client.put(
            reverse("foreign-keys-detail", args=[1]),
            {
                "title": "Model 1 updated",
                "manufacturer": 2
            },
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "CarSerializer"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 1,
                "engine_size":
                    [
                        {
                            "id": 1,
                            "title": "EngineSize 1"
                        },
                        {
                            "id": 2,
                            "title": "EngineSize 2"
                        }
                    ],
                "title": "Model 1 updated",
                "manufacturer": 2
            }
        )

    def test_foreign_key_model_api_delete_success(self):
        response = self.client.delete(
            reverse("foreign-keys-detail", args=[1]),
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "CarSerializer"
            }
        )
        self.assertEqual(response.status_code, 204)
        response = self.client.get(
            reverse("foreign-keys-list"),
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "CarSerializer"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 2,
                    "engine_size":
                        [
                            {
                                "id": 1,
                                "title": "EngineSize 1"
                            }
                        ],
                    "title": "TestModel 2",
                    "manufacturer": 1
                }
            ]
        )

    def test_runtime_assigned_model_list(self):
        response = self.client.get(
            reverse("foreign-keys-list"),
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "GenericSerializer"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "title": "TestModel 1",
                    "manufacturer": 1
                },
                {
                    "id": 2,
                    "title": "TestModel 2",
                    "manufacturer": 1
                }
            ]
        )

    def test_runtime_assigned_model_items_creation(self):
        response = self.client.post(
            reverse("foreign-keys-list"),
            {
                "title": "EngineSize",
                "car": 1
            },
            **{
                "HTTP_MODEL_CLASS": "EngineSize",
                "HTTP_SERIALIZER_CLASS": "GenericSerializer"
            }
        )
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(
            response.content,
            {
                "id": 3,
                "title": "EngineSize",
                "car": [1]
            }
        )

    def test_runtime_assigned_model_items_creation_fail(self):
        response = self.client.post(
            reverse("foreign-keys-list"),
            {
            },
            **{
                "HTTP_MODEL_CLASS": "Car",
                "HTTP_SERIALIZER_CLASS": "GenericSerializer"
            }
        )
        self.assertEqual(response.status_code, 400)

    def test_runtime_assigned_model_items_update(self):
        response = self.client.put(
            reverse("foreign-keys-detail", args=[1]),
            {
                "title": "EngineSize Renamed",
                "car": [2]
            },
            **{
                "HTTP_MODEL_CLASS": "EngineSize",
                "HTTP_SERIALIZER_CLASS": "GenericSerializer"
            }
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            {
                "id": 1,
                "title": "EngineSize Renamed",
                "car": [2]
            }
        )
