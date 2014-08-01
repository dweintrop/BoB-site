from django.conf.urls import patterns, include, url
from BoB import views

import settings

from django.contrib import admin
admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'BoB.views.home', name='home'),
    # url(r'^blog/', include('blog.urls')),
    url(r'^snap/help', views.help),
    url(r'^snap/Costumes', views.costumes),
    url(r'^snap/Sounds', views.sounds),
    url(r'^snap/Backgrounds', views.backgrounds),
    url(r'^snap/$', views.snap),

    url(r'^snapRun/$', views.snapRun ),

    url(r'^admin/', include(admin.site.urls)),

    url(r'^.*', views.login),
)

if not settings.DEBUG:
    urlpatterns += patterns('',
        (r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT}),
    )