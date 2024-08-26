from django.db import models
from django.contrib.auth.models import AbstractUser

class ExtendUser(AbstractUser):

    email = models.EmailField(blank=False, max_length=255, verbose_name='email')

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"


class City(models.Model):
    name = models.CharField(max_length=100, unique=True, blank=False)
    voivodeship = models.CharField(max_length=25, unique=True)
    area = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.name}"

class Team(models.Model):
    name = models.CharField(max_length=255, unique=True)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='teams')
     

class Player(models.Model):
    user = models.ForeignKey(ExtendUser, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    mvp = models.IntegerField(default=0)


    def __str__(self):
        return f"{self.user.username} - {self.team.name}"