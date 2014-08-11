from django import forms

class LoginForm(forms.Form):
		def __init__(self, *args, **kwargs):
			super(LoginForm, self).__init__(*args, **kwargs)
			self.fields['class_period'] = forms.ChoiceField(choices = [('graph', 'Period 1'), ('graph_read', 'Period 2'), ('graph_write', 'Period 3')])
			self.fields['class_period'].widget.attrs['class'] = 'selectBoxIt'
			# self.fields['project_choice'] = forms.ChoiceField(choices = [('new', 'New Project'), ('continue', 'Resume Project')])
			self.fields['project_choice'].widget.attrs['class'] = 'radio'
			
		student_id = forms.CharField()
		pair_id = forms.CharField(required=False)
		# project_name = forms.CharField()
		class_period = forms.CharField(widget=forms.Select)
		project_choice = forms.ChoiceField(widget=forms.RadioSelect, choices = (('continue', 'Continue Project'), ('new', 'New Project',)), initial='continue')
		