import csv, codecs, cStringIO

from django.contrib import admin
from django.http import HttpResponse
from django.conf.urls import patterns

from oas.models import SnapRun, TextInteraction
from oas.views import view_students, view_student_programs, view_xml


class SnapRunAdmin(admin.ModelAdmin):
  list_display = ('StudentID', 'PairID', 'ProjectName', 'TimeStamp', 'RunType', 'Condition', 'NumRuns', 'view_scripts', 'view_project')
  search_fields = ('StudentID', 'ProjectName', 'RunType')
  list_filter = ('TimeStamp', 'Condition', 'StudentID', 'RunType')
  actions = ['export_snapRuns']


  def view_scripts(self, obj):
      return '<a href="/program_viewer/?ProgramID=%s" target="_blank">view</a>' % (obj.id)
  view_scripts.allow_tags = True
  view_scripts.short_description = 'Load Scripts'

  def view_project(self, obj):
    url = ' '
    if (obj.RunType == 'projectClose'):
      url = '<a href="/program_viewer/?ProgramID=%s&fullProject=true" target="_blank">view</a>' % (obj.id)
    return url
  view_project.allow_tags = True
  view_project.short_description = 'Load Project'


  def export_snapRuns(studentadmin, request, queryset):
		response = HttpResponse(content_type='text/csv')

		writer = UnicodeWriter(response)
		writer.writerow(['SnapRun DB ID', 'Student ID', 'Pair ID', 'Project Name', 'TimeStamp', 'RunType', 'Condition', 'ScriptXML', 'ProjectXML', 'NumRuns'])

		for run in queryset:
			run_info = [run.id, run.StudentID, run.PairID, run.ProjectName, run.TimeStamp, run.RunType, run.Condition, run.ScriptXML, run.ProjectXML, run.NumRuns]
			writer.writerow(run_info)

		response['Content-Disposition'] = 'attachment; filename="snapruns.csv"'
		return response


class TextInteractionAdmin(admin.ModelAdmin):
  list_display = ('StudentID', 'PairID', 'TimeStamp', 'InteractionType', 'Condition')
  list_filter = ('TimeStamp', 'InteractionType')
  actions = ['export_snapTextInteractions']

  def export_snapTextInteractions(studentadmin, request, queryset):
        response = HttpResponse(content_type='text/csv')

        writer = UnicodeWriter(response)
        writer.writerow(['SnapRun DB ID', 'Student ID', 'Pair ID', 'TimeStamp', 'Interaction Type', 'Condition', 'Text'])

        for run in queryset:
            run_info = [run.id, run.StudentID, run.PairID, run.TimeStamp, run.InteractionType, run.Condition, run.Text]
            writer.writerow(run_info)

        response['Content-Disposition'] = 'attachment; filename="snapinteractions.csv"'
        return response

admin.site.register(SnapRun, SnapRunAdmin)
admin.site.register(TextInteraction, TextInteractionAdmin)

# add custom admin pages here
def get_admin_urls(urls):
    def get_urls():
        my_urls = patterns('',
            (r'^students/$', admin.site.admin_view(view_students)),
            (r'^student_programs/$', admin.site.admin_view(view_student_programs)),
            (r'^view_xml/$', admin.site.admin_view(view_xml))
        )
        return my_urls + urls
    return get_urls

admin_urls = get_admin_urls(admin.site.get_urls())
admin.site.get_urls = admin_urls

class UnicodeWriter:
    """
    A CSV writer which will write rows to CSV file "f",
    which is encoded in the given encoding.
    """

    def __init__(self, f, dialect=csv.excel, encoding="utf-8", **kwds):
        # Redirect output to a queue
        self.queue = cStringIO.StringIO()
        self.writer = csv.writer(self.queue, dialect=dialect, **kwds)
        self.stream = f
        self.encoder = codecs.getincrementalencoder(encoding)()

    def writerow(self, row):
        self.writer.writerow([s.encode('utf8') if type(s) is unicode else s for s in row])
        # Fetch UTF-8 output from the queue ...
        data = self.queue.getvalue()
        data = data.decode("utf-8")
        # ... and reencode it into the target encoding
        data = self.encoder.encode(data)
        # write to the target stream
        self.stream.write(data)
        # empty queue
        self.queue.truncate(0)

    def writerows(self, rows):
        for row in rows:
            self.writerow(row)