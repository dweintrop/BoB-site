from django.db import models

# Create your models here.
class SnapRun(models.Model):
  StudentID = models.CharField(max_length=30)
  PairID = models.CharField(max_length=30, null=True)
  ProjectName = models.CharField(max_length=50)
  TimeStamp = models.DateTimeField()
  RunType = models.CharField(max_length=20)
  Condition = models.CharField(max_length=20)
  ProjectXML = models.TextField()

  # Not going to do this for now, but could look into Amazon s3 backend
  # docs here: http://django-storages.readthedocs.org/en/latest/backends/amazon-S3.html
  # and helpful post here: http://stackoverflow.com/questions/12766642/django-heroku-s3
  # and here: http://stackoverflow.com/questions/5871730/need-a-minimal-django-file-upload-example
  # StageImage = models.ImageField()
  
  def __unicode__(self):
		return self.StudentID + ': ' + self.ProjectName + " -  " + self.TimeStamp

