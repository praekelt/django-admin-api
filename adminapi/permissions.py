from rest_framework import permissions


# TODO Permissions not used at this time
class IsStaffOrTargetUser(permissions.BasePermission):
    def has_permission(self, request, view):
        # Staff users can view user list
        return view.action == "retrieve" or request.user.is_staff

    def has_object_permission(self, request, view, obj):
        # Staff can view all records, users can view
        # logged in session user details
        return request.user.is_staff or obj == request.user
