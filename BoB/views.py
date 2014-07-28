from django.shortcuts import render


def snap(request):
    return render(request, 'snap.html')

def help(request):
    return render(request, 'help.html')
def costumes(request):
    return render(request, 'costumes.html')
def sounds(request):
    return render(request, 'sounds.html')
def backgrounds(request):
    return render(request, 'backgrounds.html')
