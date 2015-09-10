from django.test import TestCase


class TrivialTest(TestCase):

    def trivial_true_test(self):
            testVar = True
            self.assertEqual(testVar, True)
