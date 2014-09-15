import csv, codecs, cStringIO

from django.contrib import admin
from django.http import HttpResponse

from oas.models import SnapRun, TextInteraction

class SnapRunAdmin(admin.ModelAdmin):
  list_display = ('StudentID', 'PairID', 'ProjectName', 'TimeStamp', 'RunType', 'Condition', 'NumRuns')
  search_fields = ('StudentID', 'ProjectName', 'RunType')
  list_filter = ('TimeStamp', 'Condition', 'StudentID', 'RunType')
  actions = ['export_snapRuns']

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