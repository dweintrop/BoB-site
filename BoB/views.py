from django.shortcuts import render


def snap(request):
    return render(request, 'snap.html')
