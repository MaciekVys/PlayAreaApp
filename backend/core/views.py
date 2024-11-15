from django.shortcuts import redirect
from django.http import HttpResponse
import requests

def activate_account(request, token):
    # Wywołaj mutację `verifyAccount` przez API GraphQL
    graphql_url = "http://localhost:8000/graphql/"
    query = """
    mutation {
      verifyAccount(token: "%s") {
        success
        errors
      }
    }
    """ % token

    response = requests.post(graphql_url, json={'query': query})

    # Sprawdź odpowiedź GraphQL
    if response.status_code == 200 and response.json()['data']['verifyAccount']['success']:
        # Jeśli wszystko działa poprawnie, przekieruj na stronę logowania
        return redirect('http://localhost:3000/login')
    else:
        # Zwróć błąd, jeśli coś poszło nie tak
        return HttpResponse("Invalid or expired token", status=400)
    
    
