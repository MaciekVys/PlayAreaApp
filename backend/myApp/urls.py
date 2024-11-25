from django.contrib import admin
from django.urls import path, include
from django.views.decorators.csrf import csrf_exempt
from graphql_jwt.decorators import jwt_cookie
from core.schema import schema
from core.views import activate_account, status_view
from django.conf import settings
from django.conf.urls.static import static

# Import widoku FileUploadGraphQLView
from graphene_file_upload.django import FileUploadGraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/graphql/', jwt_cookie(csrf_exempt(
        FileUploadGraphQLView.as_view(graphiql=True, schema=schema)))),
    path('api/activate/<str:token>/', activate_account, name='activate_account'),
    path('api/status/', status_view, name='status'),
]


if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
