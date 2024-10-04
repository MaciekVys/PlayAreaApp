from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class ExtendUser(AbstractUser):

    email = models.EmailField(blank=False, max_length=255, verbose_name='email')

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"


class City(models.Model):
    name = models.CharField(max_length=100, unique=True, blank=False)
    voivodeship = models.CharField(max_length=25)
    area = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"{self.name}"
    

class League(models.Model):
    name = models.CharField(max_length=25, unique=True)
    level = models.IntegerField(default=1)
    city = models.ForeignKey(City, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('name', 'city')

class Team(models.Model):
    name = models.CharField(max_length=255, unique=True)
    create_time = models.DateTimeField(default=timezone.now)
    captain = models.OneToOneField(ExtendUser, on_delete=models.SET_NULL, null=True, blank=True)
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='teams_in_league', default=1)
    city = models.ForeignKey(City, on_delete=models.CASCADE, related_name='teams_in_city') 


    class Meta:
        unique_together = ('name', 'league')
     

class Player(models.Model):
    user = models.ForeignKey(ExtendUser, on_delete=models.CASCADE)
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="players")
    position = models.CharField(max_length=50, blank=True, null=True)
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    mvp = models.IntegerField(default=0)


    def __str__(self):
        return f"{self.user.username} - {self.team.name}"
    

class Match(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
    )

    home_team = models.ForeignKey(Team, related_name='home_matches', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_matches', on_delete=models.CASCADE)
    league = models.ForeignKey(League, related_name='matches', on_delete=models.CASCADE)
    match_date = models.DateTimeField()
    score_home = models.IntegerField(default=0)
    score_away = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')

    def __str__(self):
        return f"{self.home_team.name} vs {self.away_team.name} - {self.match_date}"



class Season(models.Model):
    name = models.CharField(max_length=20)
    start_date = models.DateField()
    end_date = models.DateField()


class Ranking(models.Model):
    league = models.ForeignKey(League, related_name='rankings', on_delete=models.CASCADE)
    team = models.ForeignKey(Team, related_name='rankings', on_delete=models.CASCADE)
    points = models.IntegerField(default=0)
    match_played = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    draws = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    goals_for = models.IntegerField(default=0)
    goals_against = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.team.name} in {self.league.name} - Points: {self.points}"
