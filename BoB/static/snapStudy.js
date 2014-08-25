/**
 * snapStudy.js
 * 
 * @fileoverview A series of helper functions for conducting a study with Snap!
 * @author dweintrop@u.northwestern.edu (David Weintrop)
 */

var SnapStudy = {}

SnapStudy.getCondition = function() {
	return $('#id_condition').val();
}

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

	// console.log(jsonData);
}

SnapStudy.ScriptsXML = function (ide) {
	ide.serializer.scriptsOnly = true;
	var xml = ide.serializer.serialize(ide.stage);
	ide.serializer.scriptsOnly = false;
	return xml;
}

SnapStudy.TextInteraction = function(interactionType, code) {
		var jsonData = {
		'student_id' : $('#id_student_id').val(),
		'pair_id' : $('#id_pair_id').val(),
		'condition' : $('#id_condition').val(),
		'interactionType' : interactionType, // read or write
		'text' : code
	}

	$.ajax({
		type: "POST",
		url: "/snapTextInteraction/",
		data: jsonData
	}).done(function( msg ) {
		console.log(msg);
	});
}

SnapStudy.openViewer = function(inCode, blockMorph) {
	var blockDefinition = blockMorph.definition;

	// if viewing a custom block - show the function header, else hide it
	if (blockDefinition instanceof CustomBlockDefinition && !(blockMorph.nextBlock()) ) {
		// show function structure
		$('.function-structure').show();

		// populate function name
		$('#function-name').empty().append(blockDefinition.helpSpec());
		
		// populate function args
		var args_list = [];
		$.each(blockDefinition.inputNames(), function (ind, name) {
			args_list.push('<span class="cm-def">' + name + '<span class="cm-def">');
		});
		$('#arg-list').empty().append(args_list.join(", "));
	} else {
		$('.function-structure').hide();
	}

	myCodeMirror.setOption('readOnly', true);
	myCodeMirror.setOption('cursorBlinkRate', -1);
	SnapStudy.cmDialog("Javascript Viewer", inCode, function(){});

	SnapStudy.TextInteraction('read', inCode);
}

SnapStudy.openEditor = function(inCode, blockMorph) {
	var blockDefinition = blockMorph.definition;

	// if is not a custom blockDefinition or is a script - open as viewer
	if ((!(blockDefinition instanceof CustomBlockDefinition)) || (blockMorph.nextBlock && blockMorph.nextBlock()) ) {
		SnapStudy.openViewer(inCode, blockMorph);
		return;
	}

	// show function structure
	$('.function-structure').show();

	// populate function name
	$('#function-name').empty().append(blockDefinition.helpSpec());
	
	// populate function args
	var args_list = [];
	$.each(blockDefinition.inputNames(), function (ind, name) {
		args_list.push('<span class="cm-def">' + name + '<span class="cm-def">');
	});
	$('#arg-list').empty().append(args_list.join(", "));


	myCodeMirror.setOption('readOnly', false);
	myCodeMirror.setOption('cursorBlinkRate', 530);
	SnapStudy.cmDialog("Javascript Editor", inCode, function(){
		blockDefinition.codeMapping = myCodeMirror.getValue();

		SnapStudy.TextInteraction('write', myCodeMirror.getValue());
	});
}

SnapStudy.jsHintsInterval = {};

SnapStudy.cmDialog = function (title, inCode, saveCallback) {
	var width = $(window).width() * .44;
	var height = $(window).height() * .66;


	var dialogButtons = {};

	if (myCodeMirror.options['readOnly']) {
		dialogButtons.Ok = function() {
			myCodeMirror.setValue('');
			$( this ).dialog( "close" );
		}
	} else {
		dialogButtons.Save = function() {
			SnapStudy.updateHints();
			if (SnapStudy.errorWidgets.length > 0) {
				clearInterval(SnapStudy.jsHintsInterval);
			  SnapStudy.jsHintsInterval = setInterval(SnapStudy.updateHints, 1551);
				return;
			}
			clearInterval(SnapStudy.jsHintsInterval);
			saveCallback();
			myCodeMirror.setValue('');
			$( this ).dialog( "close" );
		};
		dialogButtons.Cancel = function() {
			SnapStudy.cleanUpJSHints();
			myCodeMirror.setValue('');
			$( this ).dialog( "close" );
		}
	}

	$( "#cmDiv-wrapper" ).dialog({
		width: width,
		height: height,
		title: title,
		modal: true, 
		buttons: dialogButtons,
		close: SnapStudy.cleanUpJSHints
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

SnapStudy.cleanUpJSHints = function () {
 for (var i = 0; i < SnapStudy.errorWidgets.length; ++i) {
    myCodeMirror.removeLineWidget(SnapStudy.errorWidgets[i]);
  }
  SnapStudy.errorWidgets.length = 0;
  clearInterval(SnapStudy.jsHintsInterval);
}
