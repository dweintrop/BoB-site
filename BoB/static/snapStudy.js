/**
 * snapStudy.js
 * 
 * @fileoverview A series of helper functions for conducting a study with Snap!
 * @author dweintrop@u.northwestern.edu (David Weintrop)
 */

var SnapStudy = {}

SnapStudy.SnapRun = function(ide, clickSource) {

	projectXML = '';
	if (clickSource == 'projectClose') {
		projectXML = ide.serializer.serialize(ide.stage);
	} 

	scriptXML = SnapStudy.ScriptsXML(ide);
	

	var jsonData = {
		'student_id' : $('#id_student_id').val(),
		'pair_id' : $('#id_pair_id').val(),
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
	return ide.serializer.serialize(ide.stage);
}