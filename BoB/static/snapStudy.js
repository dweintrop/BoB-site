/**
 * snapStudy.js
 * 
 * @fileoverview A series of helper functions for conducting a study with Snap!
 * @author dweintrop@u.northwestern.edu (David Weintrop)
 */

var SnapStudy = {}

SnapStudy.SnapRun = function(xml, clickSource) {
	var jsonData = {
		'student_id' : $('#id_student_id').val(),
		'pair_id' : $('#id_pair_id').val(),
		'condition' : $('#id_condition').val(),
		'logtype' : clickSource,
		'xml' : xml
	}
	console.log(jsonData);
}