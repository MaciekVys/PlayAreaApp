import graphene
from graphene_file_upload.scalars import Upload
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from graphene_django.types import DjangoObjectType
from ..models import ExtendUser, Team


class UploadPhotoMutation(graphene.Mutation):
    class Arguments:
        file = Upload(required=True)  # Plik do przesłania

    success = graphene.Boolean()
    message = graphene.String()

    def mutate(self, info, file):
        try:
            # Zapisywanie pliku w modelu ExtendUser
            user = info.context.user  # Pobranie aktualnie zalogowanego użytkownika
            
            # Sprawdzanie, czy użytkownik nie ma już przypisanego pliku zdjęcia
            if user.photo:
                # Jeśli zdjęcie już istnieje, możemy je usunąć, jeśli chcemy
                # default_storage.delete(user.photo.name)  # Wyczyść stary plik, jeśli to konieczne
            
                pass  # Nie robimy nic w tym przypadku, można włączyć usuwanie pliku jak powyżej

            # Zapisujemy plik na serwerze
            filename = file.name
            content = file.read()  # Odczytanie zawartości pliku
            path = default_storage.save(f'users/{filename}', ContentFile(content))  # Zapisz plik na serwerze
            
            # Zaktualizowanie modelu użytkownika
            user.photo = path  # Przypisujemy ścieżkę do zdjęcia
            user.save()

            return UploadPhotoMutation(success=True, message="Photo uploaded successfully.")
        
        except Exception as e:
            return UploadPhotoMutation(success=False, message=f"Error uploading photo: {str(e)}")


from graphene import Mutation, ID, Boolean, String
from graphene_file_upload.scalars import Upload
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage

class UploadTeamLogo(Mutation):
    class Arguments:
        team_id = ID(required=True)
        file = Upload(required=True)

    success = Boolean()
    message = String()

    def mutate(self, info, team_id, file):
        if not file:
            return UploadTeamLogo(success=False, message="No file provided.")
        
        try:
            # Zapisanie pliku na serwerze
            filename = file.name
            content = file.read()
            path = default_storage.save(f'teams/{filename}', ContentFile(content))

            # Zaktualizowanie drużyny z nowym logo
            team = Team.objects.get(id=team_id)
            team.logo = path  # Jeśli masz pole ImageField dla logo drużyny
            team.save()

            return UploadTeamLogo(success=True, message="Logo uploaded successfully.")
        except Team.DoesNotExist:
            return UploadTeamLogo(success=False, message="Team not found.")
        except Exception as e:
            return UploadTeamLogo(success=False, message=str(e))

