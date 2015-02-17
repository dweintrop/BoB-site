from django.shortcuts import render
from django.http import HttpResponse

from models import SnapRun

def view_students(request):
	students = SnapRun.objects.values('StudentID', 'Condition').distinct()
	
	students_by_class = {'graph_read': [], 'graph_write': [], 'graph' : []}

	# groups students by condition and sort them
	[students_by_class[s['Condition']].append(s['StudentID']) for s in students]
	[cond.sort() for cond in students_by_class.values() ]

	return render(request, 'student_list.html', {'graphs': students_by_class['graph'], 'reads' : students_by_class['graph_read'], 'writes': students_by_class['graph_write']})

def view_student_programs(request):
	studentID = request.GET['StudentID']
	programs = SnapRun.objects.filter(StudentID=studentID).order_by("TimeStamp")
	return render(request, 'student_programs.html', {'studentID': studentID, 'programs': programs})

def view_xml(request):
	programID = request.GET['ProgramID']
	run = SnapRun.objects.get(id=programID)

	if (request.GET.get('fullProject') is not None):
		xml = run.ProjectXML
	else:
		xml = run.ScriptXML
	return HttpResponse(xml, content_type="application/xhtml+xml")

def fix_bad_xml(request):
	count = 0
	allRuns = SnapRun.objects.all()[9500:15500]
	for run in allRuns:
		if '" <variables' in run.ScriptXML:
			run.ScriptXML = run.ScriptXML.replace('" <variables', '"><variables') 
			run.save()
			count += 1
	return HttpResponse("upated " + str(count))