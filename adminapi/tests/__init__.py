from django.test import TestCase


class TrivialTest(TestCase):

    def trivial_true_test(self):
            test_var = True
            self.assertEqual(test_var, True)
