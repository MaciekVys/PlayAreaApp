import uuid
from firebase_admin import storage

def upload_image_to_firebase(image_file):
    """
    Przesyła obraz do Firebase Storage i zwraca jego publiczny URL.
    
    :param image_file: Plik obrazu (np. Django InMemoryUploadedFile)
    :return: Publiczny URL do obrazu w Firebase Storage
    """
    # Generowanie unikalnej nazwy pliku
    file_name = f"{uuid.uuid4()}.jpg"  # Możesz dostosować rozszerzenie pliku

    # Pobranie referencji do Firebase Storage
    bucket = storage.bucket()
    blob = bucket.blob(file_name)

    # Przesyłanie pliku do Firebase
    blob.upload_from_file(image_file)

    # Ustawienie publicznego dostępu do pliku
    blob.make_public()

    # Zwrócenie URL pliku
    return blob.public_url
