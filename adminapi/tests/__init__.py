import base64
import os
import glob
import json

from django.test import TestCase
from django.db import models
from django.contrib.auth.models import User
from django.test import RequestFactory
from django.core.urlresolvers import reverse

from rest_framework.test import APIRequestFactory, APIClient
from rest_framework.authtoken.models import Token

import adminapi

RES_DIR = os.path.join(os.path.dirname(__file__), "res")
IMAGE_PATH = os.path.join(RES_DIR, "image.jpg")


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

models.register_models("tests", EngineSize)


class ImageModel(models.Model):
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to=RES_DIR)

models.register_models("tests", ImageModel)


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
                "detail": "Credentials validated",
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


class ModelsTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpClass(cls):
        cls.manufacturer = Manufacturer()
        cls.manufacturer.title = "BMW"
        cls.manufacturer.save()

        cls.car_1 = Car()
        cls.car_1.title = "CarModel_1"
        cls.car_1.manufacturer = \
            cls.manufacturer
        cls.car_1.save()
        cls.car_2 = Car()
        cls.car_2.title = "CarModel_2"
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
        super(ModelsTest, cls).tearDownClass()

    """ Test a generic viewset, urls serializer
    as well as parsing specific models defined in the url
    """
    def test_car_model_api_list_response_success(self):
        response = self.client.get(
            reverse("test-generic-list", args=["adminapi", "car"]),
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
                    "title": "CarModel_1",
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
                    "title": "CarModel_2",
                    "manufacturer": 1
                }
            ]
        )

    def test_car_model_api_create_success(self):
        response = self.client.post(
            reverse("test-generic-list", args=["adminapi", "car"]),
            {
                "title": "POST_operation_car",
                "manufacturer": 1
            },
        )
        self.assertEqual(response.status_code, 201)
        self.assertJSONEqual(
            response.content,
            {
                "manufacturer": 1,
                "engine_size": [],
                "id": 3,
                "title": "POST_operation_car"
            },
        )

    def test_car_model_api_fetch_detail_success(self):
        response = self.client.get(
            reverse("test-generic-detail", args=["adminapi", "car", 1]),
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
                "title": "CarModel_1",
                "manufacturer": 1
            }
        )

    def test_car_model_api_update_success(self):
        self.manufacturer = Manufacturer()
        self.manufacturer.title = "Mercedes"
        self.manufacturer.save()
        response = self.client.put(
            reverse("test-generic-detail", args=["adminapi", "car", 1]),
            {
                "title": "Jeep",
                "manufacturer": 2
            },
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
                "title": "Jeep",
                "manufacturer": 2
            }
        )

    def test_car_model_api_delete_success(self):
        response = self.client.delete(
            reverse("test-generic-detail", args=["adminapi", "car", 1]),
        )
        self.assertEqual(response.status_code, 204)
        response = self.client.get(
            reverse("test-generic-list", args=["adminapi", "car"]),
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
                    "title": "CarModel_2",
                    "manufacturer": 1
                }
            ]
        )

    def test_generic_serializer_list_retrieve(self):
        response = self.client.get(
            reverse("test-generic-list", args=["adminapi", "enginesize"]),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "title": "EngineSize 1",
                    "car": [1, 2]
                },
                {
                    "id": 2,
                    "title": "EngineSize 2",
                    "car": [1]
                }
            ]
        )

    def test_generic_serializer_item_create(self):
        response = self.client.post(
            reverse("test-generic-list", args=["adminapi", "enginesize"]),
            {
                "title": "EngineSize",
                "car": 1
            },
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

    def test_generic_serializer_items_creation_fail(self):
        response = self.client.post(
            reverse("test-generic-list", args=["adminapi", "enginesize"]),
            {
            },
        )
        self.assertEqual(response.status_code, 400)

    def test_generic_serializer_items_update(self):
        response = self.client.put(
            reverse("test-generic-detail", args=["adminapi", "enginesize", 1]),
            {
                "title": "EngineSize Renamed",
                "car": [2]
            },
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

    def test_generic_serializer_items_incorrect_variables_update(self):
        response = self.client.put(
            reverse("test-generic-detail", args=["adminapi", "enginesize", 1]),
            {
                "NoNtitle": "EngineSize Renamed",
                "car": [2]
            },
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "title": ["This field is required."]
            }
        )

    def test_no_matching_model_name_from_url_error_list(self):
        response = self.client.get(
            reverse("test-generic-list", args=["noneApp", "noneType"]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    def test_no_matching_model_name_from_url_error_post(self):
        response = self.client.post(
            reverse("test-generic-list", args=["noneApp", "noneType"]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    def test_no_matching_model_name_from_url_error_put(self):
        response = self.client.put(
            reverse("test-generic-detail", args=["noneApp", "noneType", 2]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    def test_no_matching_model_name_from_url_error_detail_get(self):
        response = self.client.get(
            reverse("test-generic-detail", args=["noneApp", "noneType", 2]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    """Test the generic viewset, urls and serialzier for the API
    """
    def test_API_generic_serializer_item_create(self):
        response = self.client.post(
            reverse("api:generic-list", args=["adminapi", "enginesize"]),
            {
                "title": "EngineSize",
                "car": 1
            },
        )

    def test_API_generic_serializer_list_retrieve(self):
        response = self.client.get(
            reverse("api:generic-list", args=["adminapi", "enginesize"]),
        )
        self.assertEqual(response.status_code, 200)
        self.assertJSONEqual(
            response.content,
            [
                {
                    "id": 1,
                    "title": "EngineSize 1",
                    "car": [1, 2]
                },
                {
                    "id": 2,
                    "title": "EngineSize 2",
                    "car": [1]
                }
            ]
        )

    def test_API_no_matching_model_name_from_url_error_detail_get(self):
        response = self.client.get(
            reverse("api:generic-detail", args=["adminapi", "noneType", 2]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    def test_API_no_matching_model_name_from_url_error_list(self):
        response = self.client.get(
            reverse("api:generic-list", args=["noneApp", "noneType"]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    def test_API_no_matching_model_name_from_url_error_post(self):
        response = self.client.post(
            reverse("api:generic-list", args=["noneApp", "noneType"]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )

    def test_API_no_matching_model_name_from_url_error_put(self):
        response = self.client.put(
            reverse("api:generic-detail", args=["noneApp", "noneType", 2]),
        )
        self.assertEqual(response.status_code, 400)
        self.assertJSONEqual(
            response.content,
            {
                "detail": "Model or App does not exist"
            }
        )


class MultiPartFormFieldTest(TestCase):

    def setUp(self):
        self.client = APIClient()

    @classmethod
    def setUpClass(cls):
        cls.image_model = ImageModel()
        cls.image_model.title = "Image model 1"
        cls.image_model.save()

    @classmethod
    def tearDownClass(cls):
        super(MultiPartFormFieldTest, cls).tearDownClass()

    def test_image_upload_API(self):
        client = APIClient()
        response = client.post(
            reverse("test-generic-list", args=["adminapi", "imagemodel"]),
            {
                "title": "Image model 2",
                "image": open(IMAGE_PATH)
            },
            format="multipart"
        )
        self.assertEqual(response.status_code, 201)
        # Test that image was saved to directory and then delete it
        self.assertTrue(os.path.isfile(glob.glob(RES_DIR + "/image_*.jpg")[0]))
        os.remove(glob.glob(RES_DIR+"/image_*.jpg")[0])
        parsed_json = json.loads(response.content)
        self.assertEqual(parsed_json["title"], "Image model 2")
        self.assertEqual(parsed_json["id"], 2)

    def test_image_update_API(self):
        client = APIClient()
        response = client.put(
            reverse("test-generic-detail", args=["adminapi", "imagemodel", 1]),
            {
                "image": open(IMAGE_PATH)
            },
            format="multipart"
        )
        # Test that image was saved to directory and then delete it
        self.assertTrue(os.path.isfile(glob.glob(RES_DIR + "/image_*.jpg")[0]))
        os.remove(glob.glob(RES_DIR+"/image_*.jpg")[0])
        parsed_json = json.loads(response.content)
        self.assertEqual(parsed_json["id"], 1)
