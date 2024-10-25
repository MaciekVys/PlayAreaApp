import django_filters
from .models import ExtendUser, City, Team

class ExtendUserFilter(django_filters.FilterSet):
    username = django_filters.CharFilter(field_name="username", lookup_expr="icontains")

    class Meta:
        model = ExtendUser
        fields = ['username']

class CityFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = City
        fields = ['name']

class TeamFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(field_name="name", lookup_expr="icontains")

    class Meta:
        model = Team
        fields = ['name']
