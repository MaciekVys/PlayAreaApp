from gettext import translation
from django.db import transaction
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import date

class ExtendUser(AbstractUser):
    email = models.EmailField(blank=False, max_length=255, verbose_name='email')
    city = models.ForeignKey('City', on_delete=models.SET_NULL, null=True, blank=True)
    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name="players_in_team", null=True, blank=True)
    position = models.CharField(max_length=50, blank=True, null=True)
    weight = models.IntegerField(default=0)
    height = models.IntegerField(default=0)
    number = models.IntegerField(default=0)
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    mvp = models.IntegerField(default=0)
    photo = models.ImageField(upload_to='users/', null=True, blank=True)
    is_member = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} - {self.team.name}"

    USERNAME_FIELD = "username"
    EMAIL_FIELD = "email"

    def __str__(self):
        return self.username
    

    def leave_team(self):
        if self.team:
            previous_team_id = self.team.id

            # Zapisanie statystyk gracza dla poprzedniego okresu gry w drużynie
            stats, created = PlayerTeamStatistics.objects.get_or_create(
                player=self,
                team_id=previous_team_id,
                date_left__isnull=True  # Znajdź bieżący, otwarty okres dla tej drużyny
            )

            # Zaktualizuj dane statystyczne oraz ustaw datę opuszczenia drużyny
            stats.goals += self.goals
            stats.assists += self.assists
            stats.mvp += self.mvp
            stats.date_left = date.today()
            stats.save()

            # Resetowanie statystyk gracza
            self.goals = 0
            self.assists = 0
            self.mvp = 0
            self.team = None
            self.save()


    # def join_team(self, new_team):
    #     # Jeśli gracz już jest w drużynie, najpierw musi ją opuścić
    #     if self.team:
    #         self.leave_team()

    #     # Przypisanie nowej drużyny
    #     self.team = new_team
    #     self.save()

    #     # Utwórz nowy rekord dla nowego okresu gry w tej drużynie
    #     PlayerTeamStatistics.objects.create(
    #         player=self,
    #         team=new_team,
    #         date_joined=date.today()  # Ustawienie daty dołączenia do drużyny
    #     )

    #     print(f"Gracz {self.username} dołączył do drużyny {new_team.name} od {date.today()}.")



class League(models.Model):
    name = models.CharField(max_length=25, unique=True)
    level = models.IntegerField(default=1)
    city = models.OneToOneField('City', on_delete=models.CASCADE, related_name='league', null=True, blank=True)


class City(models.Model):
    name = models.CharField(max_length=100, unique=True, blank=False)
    voivodeship = models.CharField(max_length=25)
    area = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='cities/', null=True, blank=True)  # Dodanie pola do zdjęcia miasta


    def __str__(self):
        return f"{self.name}"
    

class Team(models.Model):
    name = models.CharField(max_length=255, unique=True)
    create_time = models.DateTimeField(default=timezone.now)
    captain = models.OneToOneField(ExtendUser, on_delete=models.SET_NULL, null=True, blank=True,related_name="captain_of_team")
    league = models.ForeignKey(League, on_delete=models.CASCADE, related_name='teams_in_league', default=1)
    logo = models.ImageField(upload_to='teams/', null=True, blank=True)
    players = models.ManyToManyField(ExtendUser, related_name="teams", blank=True) 

    class Meta:
        unique_together = ('name', 'league')
        
     

class Match(models.Model):
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('canceled', 'Canceled'),
        ('pending', 'Pending'),
    )

    home_team = models.ForeignKey(Team, related_name='home_matches', on_delete=models.CASCADE)
    away_team = models.ForeignKey(Team, related_name='away_matches', on_delete=models.CASCADE)
    city = models.ForeignKey(City, related_name='matches', on_delete=models.CASCADE, default=1)
    match_date = models.DateField()
    match_result = models.OneToOneField('MatchResult', on_delete=models.CASCADE, null=True, blank=True, related_name='match_result')
    score_home = models.IntegerField(default=0)
    score_away = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    is_responded = models.BooleanField(default=False)  
    is_completed = models.BooleanField(default=False)


class MatchResult(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    home_team_confirmed = models.BooleanField(default=False)
    away_team_confirmed = models.BooleanField(default=False)

    def is_confirmed(self):
        return self.home_team_confirmed and self.away_team_confirmed
    

class PlayerTeamStatistics(models.Model):
    player = models.ForeignKey(ExtendUser, on_delete=models.CASCADE, related_name="team_stats")
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name="player_stats")
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    mvp = models.IntegerField(default=0)
    date_left = models.DateField(null=True, blank=True)
    date_joined = models.DateField(null=True, blank=True)  # Data dołączenia do drużyny

    class Meta:
        unique_together = ('player', 'team', 'date_joined')  # Jeden rekord dla kombinacji gracza, drużyny i daty dołączenia

    def __str__(self):
        return f"{self.player.username} stats in {self.team.name} from {self.date_joined} to {self.date_left or 'present'}" 
    
class PlayerStatistics(models.Model):
    player = models.ForeignKey(ExtendUser, on_delete=models.CASCADE)
    match = models.ForeignKey(Match, on_delete=models.CASCADE)
    goals = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    is_mvp = models.BooleanField(default=False)
    
    class Meta:
            unique_together = ('player', 'match') 
    

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
    goal_difference = models.IntegerField(default=0)  # Nowe pole dla bilansu bramek

    class Meta:
        unique_together = ('league', 'team')

    def __str__(self):
        return f"{self.team.name} in {self.league.name} - Points: {self.points}"
    
    def save(self, *args, **kwargs):
        # Automatyczne obliczanie goal_difference przed zapisaniem do bazy danych
        self.goal_difference = self.goals_for - self.goals_against
        super(Ranking, self).save(*args, **kwargs)
    

class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ('match_invite', 'Match Invite'),
        ('message', 'Message'),
        ('match_result', 'Match Result'),
        ('join_request', 'Join Request'), 
        ('team_invite', 'Team Invite'),
    )
    NOTIFICATION_STATUS = (
        ('pending','Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined')
    )

    sender = models.ForeignKey(ExtendUser, on_delete=models.CASCADE, related_name="sent_notifications", null=True, blank=True)  # Nowe pole dla nadawcy
    recipient = models.ForeignKey(ExtendUser, on_delete=models.CASCADE, related_name="received_notifications")  # Pole dla adresata
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    match = models.ForeignKey(Match, on_delete=models.CASCADE, null=True, blank=True, related_name="match_notifications")
    message = models.TextField(null=True, blank=True)
    is_read = models.BooleanField(default=False)
    is_responded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(choices=NOTIFICATION_STATUS, default='pending', max_length=20)


    def __str__(self):
        return f"{self.get_notification_type_display()} from {self.sender} to {self.recipient}"
    
