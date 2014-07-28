from django.shortcuts import render


def snap(request):
    return render(request, 'snap.html')

# pass through mappings to get around my not being able to figure out how to show an image directory
def help(request):
    return render(request, 'help.html')
def costumes(request):
    return render(request, 'costumes.html')
def sounds(request):
    return render(request, 'sounds.html')
def backgrounds(request):
    return render(request, 'backgrounds.html')
