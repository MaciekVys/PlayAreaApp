from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphql_jwt.decorators import jwt_cookie
from core.schema import schema
from core.views import activate_account
from django.conf import settings
from django.conf.urls.static import static

# Zastępujemy standardowy GraphQLView widokiem FileUploadGraphQLView
from graphene_file_upload.django import FileUploadGraphQLView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', jwt_cookie(csrf_exempt(
        FileUploadGraphQLView.as_view(graphiql=True, schema=schema)))),
    path('activate/<str:token>/', activate_account, name='activate_account'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
