from rest_framework.permissions import BasePermission

class IsOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        # Application, Reminder belong to user; others traverse relations
        owner = getattr(obj, 'user', None)
        if owner: return owner == request.user
        # Traverse for nested models
        if hasattr(obj, 'application') and hasattr(obj.application, 'user'):
            return obj.application.user == request.user
        return True  # allow safe for public (e.g., Company)
