import csv, codecs, cStringIO

from django.contrib import admin
from django.http import HttpResponse

from oas.models import SnapRun

class SnapRunAdmin(admin.ModelAdmin):
  list_display = ('StudentID', 'PairID', 'ProjectName', 'TimeStamp', 'RunType', 'Condition')
  list_filter = ('TimeStamp', 'Condition')
  actions = ['export_snapRuns']

  def export_snapRuns(studentadmin, request, queryset):
		response = HttpResponse(content_type='text/csv')

		writer = UnicodeWriter(response)
		writer.writerow(['SnapRun DB ID', 'Student ID', 'Pair ID', 'Project Name', 'TimeStamp', 'RunType', 'Condition', 'ProjectXML'])

		for run in queryset:
			run_info = [run.id, run.StudentID, run.PairID, run.ProjectName, run.TimeStamp, run.RunType, run.Condition, run.ProjectXML]
			writer.writerow(run_info)

		response['Content-Disposition'] = 'attachment; filename="snapruns.csv"'
		return response

admin.site.register(SnapRun, SnapRunAdmin)

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