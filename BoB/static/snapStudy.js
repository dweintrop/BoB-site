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

SnapStudy.openViewer = function(inCode) {
	myCodeMirror.setOption('readOnly', true);
	myCodeMirror.setOption('cursorBlinkRate', -1);
	SnapStudy.cmDialog("Javascript Viewer", inCode, function(){});
}

SnapStudy.openEditor = function(inCode, block) {
	// if is not a custom block - open as viewer
	if (!(block instanceof CustomCommandBlockMorph)) {
		SnapStudy.openViewer(inCode);
		return;
	}

	myCodeMirror.setOption('readOnly', false);
	myCodeMirror.setOption('cursorBlinkRate', 530);
	SnapStudy.cmDialog("Javascript Editor", inCode, function(){
		block.definition.codeMapping = myCodeMirror.getValue();
	});
}

SnapStudy.cmDialog = function (title, inCode, closeCallback) {
	var width = $(window).width() * .44;
	var height = $(window).height() * .66;

	var jsHintsInterval = {};

	$( "#cmDiv" ).dialog({
		width: width,
		height: height,
		title: title,
		modal: true,
		buttons: {
			Ok: function() {
				if (!myCodeMirror.options['readOnly']) {
					SnapStudy.updateHints();
					if (SnapStudy.errorWidgets.length > 0) {
						clearInterval(jsHintsInterval);
					  jsHintsInterval = setInterval(SnapStudy.updateHints, 999);
						return;
					}
				}
				clearInterval(jsHintsInterval);
				$( this ).dialog( "close" );
			}
		},
		beforeClose: closeCallback
	});

	// fill it with the code from the clicked box
	myCodeMirror.setValue(inCode);

	// hide the text bubble
	world.hand.destroyTemporaries();
}

SnapStudy.errorWidgets = [];

SnapStudy.updateHints = function() {
  myCodeMirror.operation(function(){
    for (var i = 0; i < SnapStudy.errorWidgets.length; ++i) {
      myCodeMirror.removeLineWidget(SnapStudy.errorWidgets[i]);
    }
    SnapStudy.errorWidgets.length = 0;

    JSHINT(myCodeMirror.getValue(), {
    	evil: true
    });

    for (var i = 0; i < JSHINT.errors.length; ++i) {
      var err = JSHINT.errors[i];
      if (!err) continue;
      var msg = document.createElement("div");
      var icon = msg.appendChild(document.createElement("span"));
      icon.innerHTML = "!!";
      icon.className = "lint-error-icon";
      msg.appendChild(document.createTextNode(err.reason));
      msg.className = "lint-error";
      SnapStudy.errorWidgets.push(myCodeMirror.addLineWidget(err.line - 1, msg, {coverGutter: false, noHScroll: true}));
    }
  });
  var info = myCodeMirror.getScrollInfo();
  var after = myCodeMirror.charCoords({line: myCodeMirror.getCursor().line + 1, ch: 0}, "local").top;
  if (info.top + info.clientHeight < after)
    myCodeMirror.scrollTo(null, after - info.clientHeight + 3);
}

