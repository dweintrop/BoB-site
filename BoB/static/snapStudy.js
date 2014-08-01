/**
 * snapStudy.js
 * 
 * @fileoverview A series of helper functions for conducting a study with Snap!
 * @author dweintrop@u.northwestern.edu (David Weintrop)
 */

var SnapStudy = {}

SnapStudy.SnapRun = function(ide, clickSource) {

	var projectXML = '';
	if (clickSource == 'projectClose' && ide) {
		projectXML = ide.serializer.serialize(ide.stage);
	} 

	var scriptXML = SnapStudy.ScriptsXML(ide);
	
	var jsonData = {
		'student_id' : $('#id_student_id').val(),
		'pair_id' : $('#id_pair_id').val(),
		'project_name' : (ide.projectName) ? ide.projectName : 'Untitled',
		'condition' : $('#id_condition').val(),
		'run_type' : clickSource,
		'scriptXML' : scriptXML,
		'projectXML' : projectXML
	}

	$.ajax({
		type: "POST",
		url: "/snapRun/",
		data: jsonData
	}).done(function( msg ) {
		console.log(msg);
	});

	console.log(jsonData);
}

SnapStudy.ScriptsXML = function (ide) {
	ide.serializer.scriptsOnly = true;
	var xml = ide.serializer.serialize(ide.stage);
	ide.serializer.scriptsOnly = false;
	return xml;
}

SnapStudy.openEditor = function (inCode) {
	var width = $(window).width() * .44;
	var height = $(window).height() * .66;

	$( "#cmDiv" ).dialog({
		width: width,
		height: height,
		buttons: {
			Ok: function() {
				$( this ).dialog( "close" );
			}
		}
	});

	// fill it with the code from the clicked box
	myCodeMirror.setValue(inCode);

	// hide the text bubble
	world.hand.destroyTemporaries();
}