from django import forms

class LoginForm(forms.Form):
		def __init__(self, *args, **kwargs):
			super(LoginForm, self).__init__(*args, **kwargs)
			self.fields['class_period'] = forms.ChoiceField(choices = [('graph', 'Period 1'), ('graph_read', 'Period 2'), ('graph_write', 'Period 3')])
			self.fields['class_period'].widget.attrs['class'] = 'selectBoxIt'

		student_id = forms.CharField()
		pair_id = forms.CharField(required=False)
		# project_name = forms.CharField()
		class_period = forms.CharField(widget=forms.Select)
		