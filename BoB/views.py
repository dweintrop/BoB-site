from django.shortcuts import render
from django.http import HttpResponse

from forms import LoginForm
from oas.models import SnapRun, TextInteraction

import datetime 

def login(request):
    return render(request, 'login.html', {'form': LoginForm()})

def snap(request):
	if request.method == 'POST':
		form = LoginForm(request.POST)
		if form.is_valid():
			projectXML = '';
			if (request.POST['project_choice'] == 'continue'):
				project = SnapRun.objects.filter(StudentID=request.POST['student_id'], PairID=request.POST['pair_id'], RunType='projectClose').order_by("-TimeStamp").first()
				if (project):
					projectXML = project.ProjectXML

			return render(request, 'snap.html', {'form': form, 'projectXML': projectXML})
		else:
			return render(request, 'login.html', {'form': form})
	        # return HttpResponse(form.errors)
	else:
		return render(request, 'login.html', {'form': LoginForm()})

# store run 
def snapRun(request):
	if request.method == 'POST':
		snapRun = SnapRun(
			StudentID = request.POST['student_id'],
			PairID = request.POST['pair_id'],
			ProjectName = request.POST['project_name'],
			TimeStamp = datetime.datetime.now(),
			Condition = request.POST['condition'],
			RunType = request.POST['run_type'],
			ScriptXML = request.POST['scriptXML'],
			ProjectXML = request.POST['projectXML'],
			NumRuns = 1
			)

		previousRunCount = SnapRun.objects.filter(StudentID=snapRun.StudentID, PairID=snapRun.PairID, ScriptXML=snapRun.ScriptXML).count()
		if (previousRunCount > 0 and snapRun.RunType != 'projectClose'):
			previousRun = SnapRun.objects.filter(StudentID=snapRun.StudentID, PairID=snapRun.PairID, ScriptXML=snapRun.ScriptXML).order_by("-TimeStamp").first()
			previousRun.NumRuns += 1
			previousRun.save()
		else:
			snapRun.save()
		return HttpResponse('success')

	return HttpResponse('faliure')

# store a user viewing/editing code
def snapTextInteraction(request): 
	if request.method == 'POST':
		textInteraction = TextInteraction(
			StudentID = request.POST['student_id'],
			PairID = request.POST['pair_id'],
			TimeStamp = datetime.datetime.now(),
			Condition = request.POST['condition'],
			InteractionType = request.POST['interactionType'],
			Text = request.POST['text']
			)
		textInteraction.save()
		return HttpResponse('success')
	return HttpResponse('faliure')


# pass through mappings to get around my not being able to figure out how to show an image directory
def help(request):
    return render(request, 'help.html')
def costumes(request):
    return render(request, 'costumes.html')
def sounds(request):
    return render(request, 'sounds.html')
def backgrounds(request):
    return render(request, 'backgrounds.html')
