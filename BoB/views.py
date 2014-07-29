from django.shortcuts import render
from forms import LoginForm

def login(request):
    return render(request, 'login.html', {'form': LoginForm()})

def snap(request):
	if request.method == 'POST':
		form = LoginForm(request.POST)
		if form.is_valid():
			return render(request, 'snap.html', {'form': form})
		else:
			return render(request, 'login.html', {'form': form})
	        # return HttpResponse(form.errors)
	else:
		return render(request, 'login.html', {'form': LoginForm()})

# store run 
def snapRun(request):

	return False

# pass through mappings to get around my not being able to figure out how to show an image directory
def help(request):
    return render(request, 'help.html')
def costumes(request):
    return render(request, 'costumes.html')
def sounds(request):
    return render(request, 'sounds.html')
def backgrounds(request):
    return render(request, 'backgrounds.html')
