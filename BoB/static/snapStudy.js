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

SnapStudy.lastDitchExport = function() {
    SnapStudy.SnapRun(world.children[0],'manual');
}

SnapStudy.SnapRun = function(ide, clickSource) {

    var projectXML = '';
    if ((clickSource == 'projectClose' || clickSource == 'manual') && ide) {
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
    } else if (blockMorph instanceof HatBlockMorph) {
        // show function structure
        $('.function-structure').show();
        $('#arg-list').empty();

        var functionName = "Event";
        switch (blockMorph.selector) {
            case "receiveGo":
                functionName = "whenGreenFlagClicked";
                break;
            case "receiveKey":
                functionName = "whenKeyPressed";
                break;
            case "receiveClick":
                functionName = "whenIamClicked";
                break;
            case "receiveMessage":
                functionName = "whenMessageReceived";
                break;
        }
            
        // chop off leading \n that comes from not having hatBlock defined
        inCode = inCode.substr(1)
        // populate function name
        $('#function-name').empty().append(functionName);
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
    var width = $(window).width() * .44,
        height = $(window).height() * .66,
        openDialogs = $('.ui-dialog').length;

    var dialogButtons = {};

    console.log();

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

                // TODO: add logic to record attempts to save that contain errors
                // saveCallback();
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
        dialogButtons.Run = function() {
            SnapStudy.cleanUpJSHints();
            myCodeMirror.setValue('');
            $( this ).dialog( "close" );
        }
    }

    // perform a check to see if a dialog is already present.
    // if one doesn't exist, continue normally
    // else, clone it and insert the new information
    if (openDialogs == 0) {
        $( "#cmDiv-wrapper" ).dialog({
            width: width,
            height: height,
            title: title, 
            buttons: dialogButtons,
            close: SnapStudy.cleanUpJSHints
        });

        // fill it with the code from the clicked box
        myCodeMirror.setValue(inCode);
    }
    else {
        var i = openDialogs + 1,
            clone = $("#cmDiv-wrapper").clone().appendTo('body'),
            myNewCodeMirror;
        
        clone.find('#cmDiv').attr("id", "cmDiv"+i).empty();
        
        clone.dialog({
            width: width,
            height: height,
            title: title, 
            buttons: dialogButtons,
            close: function (e, ui) {
                $(this).dialog('destroy').remove();
                SnapStudy.cleanUpJSHints
            }
        });

        // setup javascript editor
        var cm = document.getElementById('cmDiv'+i);
        myNewCodeMirror = CodeMirror(cm, {
            mode: "javascript",
            lineNumbers:true, 
            tabSize:2,
            matchBrackets: true,
            extraKeys: {"Ctrl-Space": "autocomplete"}
        });

        if (title == "Javascript Viewer") {
            myNewCodeMirror.setOption('readOnly', true);
            myNewCodeMirror.setOption('cursorBlinkRate', -1);
        } else {
            myNewCodeMirror.setOption('readOnly', false);
            myNewCodeMirror.setOption('cursorBlinkRate', 530);
        }
        // try and remove the code bubble from the code of block
        myNewCodeMirror.on('focus', hideCodeBubble);
        myNewCodeMirror.on('blur', hideCodeBubble);
        // myNewCodeMirror.setValue("");
        // console.log(inCode);
        myNewCodeMirror.setValue(inCode);
    }


    

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

SnapStudy.codeMappings = {
// Motion
    forward: "this.forward(<#1>);",
    turn: "this.turnRight(<#1>);",
    turnLeft: "this.turnLeft(<#1>);",
    setHeading: "this.setHeading(<#1>);",
    gotoXY: "this.gotoXY(<#1>, <#2>);",
    doGlide: "this.glide(<#1>, <#2>, <#3>);",
    changeXPosition: "this.changeXPosition(<#1>);",
    setXPosition: "this.setXPosition(<#1>);",
    changeYPosition: "this.changeYPosition(<#1>);",
    setYPosition: "this.setYPosition(<#1>);",
    bounceOffEdge: "this.bounceOffEdge();",
    xPosition: "this.xPosition()",
    yPosition: "this.yPosition()",
    direction: "this.heading",
    doFaceTowards: "this.faceTowards(<#1>);",
    doGotoObject: "this.gotoObject(<#1>);",

// Looks
    doSwitchToCostume: "this.switchToCostume(<#1>);",
    doWearNextCostume: "this.wearNextCostume();",
    getCostumeIdx: "this.getCostumeId();",
    doSayFor: "this.sayFor(<#1>, <#2>);",
    bubble: "this.say(<#1>);",
    doThinkFor: "this.thinkFor(<#1>, <#2>);",
    doThink: "this.think(<#1>);",
    changeEffect: "this.changeEffect(['<#1>'], <#2>);",
    setEffect: "this.setEffect(['<#1>'], <#2>);",
    clearEffects: "this.clearEffects();",
    changeScale: "this.changeScale(<#1>);",
    setScale: "this.setScale(<#1>);",
    getScale: "(this.scale * 100)",
    show: "this.show();",
    hide: "this.hide();",
    comeToFront: "this.comeToFront();",
    goBack: "this.goBack(<#1>);",
    doScreenshot: "this.doScreenshot(<#1>, <#2>);",

// Sound
    playSound: "this.playSound(<#1>);",
    doPlaySoundUntilDone: "this.playSoundUntilDone(<#1>);",
    doStopAllSounds: "this.stopAllSounds();",
    doRest: "this.rest(<#1>);",
    doPlayNote: "this.playNote(<#1>, <#2>);",
    doChangeTempo: "this.changeTempo(<#1>);",
    doSetTempo: "this.setTempo(<#1>);",
    getTempo: "this.getTempo()",

// Pen
    clear: "this.clear();",
    down: "this.down();",
    up: "this.up();",
    setColor: "this.setColor('<#1>');",
    changeHue: "this.changeHue(<#1>);",
    setHue: "this.setHue(<#1>);",
    changeBrightness: "this.changeBrightness(<#1>);",
    setBrightness: "this.setBrightness(<#1>);",
    changeSize: "this.changeSize(<#1>);",
    setSize: "this.setSize(<#1>);",
    doStamp: "this.stamp();",
    
// Control
    receiveGo: "",
    /* These are handled specially in SnapStudy's openViewer method
    receiveGo: "this.getStage().fireGreenFlagEvent();",
    receiveKey: "this.allHatBlocksForKey(<#1>);",
    receiveClick: 
    receiveMessage: 
    */  
    doBroadcast: "this.broadcast(<#1>);",
    doBroadcastAndWait: "this.broadcastAndWait(<#1>);",
    getLastMessage:"this.getLastMessage()",
    doWait: "this.wait(<#1>);",
    doWaitUntil: "this.waitUntil(<#1>);",
    doForever: "while (true) {\n  <#1>\n}",
    doRepeat: "for (var i = 0; i < <#1>; i++) {\n  <#2>\n}",
    doWhile: "while (<#1>) {\n  <#2>\n}",
    doUntil: "do {\n  <#2>\n} while (!(<#1>));",
    doIf: "if (<#1>) {\n  <#2>\n}",
    doIfElse: "if (<#1>) {\n  <#2>\n} else {\n  <#3>\n}",
    doReport: "return <#1>;",
    doStopThis: "this.stopThis('<#1>');",
    doStopOthers: "this.stopOthers('<#1>');",
    doRun: "eval(<#1>);",
    // fork:
    evaluate: "eval(<#1>);",
    doCallCC: "eval(<#1>);",
    reportCallCC: "eval(<#1>);",
    doWarp:  "this.warp(<#1>);",
    // receiveOnClone: {
    createClone: "this.createClone(<#1>);",
    removeClone: "this.removeClone();",

// Sensing
    reportTouchingObject: "this.isTouchingObject(<#1>)",
    reportTouchingColor: "this.isTouchingColor('<#1>')",
    reportColorIsTouchingColor: "this.isColorTouchingColor('<#1>', '<#2>')",
    doAsk: "this.ask(<#1>);",
    getLastAnswer: "this.getLastAnswer()",
    reportMouseX: "this.getMouseX()",
    reportMouseY: "this.getMouseY()",
    reportMouseDown: "this.isMouseDown()",
    reportKeyPressed: "this.isKeyPressed('<#1>')",
    reportDistanceTo: "this.getDistanceTo(<#1>)",
    doResetTimer: "this.resetTimer();",
    reportTimer: "this.getTimer()",
    getTimer: "this.getTimer()",
    reportAttributeOf: "this.getAttributeOf(['<#1>'], <#2>)",
    reportURL: "this.getURL(<#1>)",
    reportIsFastTracking: "this.isTurboModeOn()",
    doSetFastTracking: "this.setTurboMode(<#1>)",
    reportDate: "this.getDate('<#1>')",
    
// Operators
    reifyScript: "this.getProcess().reifyScript(<#1>, <#2>);",
    reifyReporter: "this.getProcess().reifyReporter(<#1>, <#2>);",
    reifyPredicate: "this.getProcess().reifyPredicate(<#1>, <#2>);",
    reportSum: "(<#1> + <#2>)",
    reportDifference: "(<#1> - <#2>)",
    reportProduct: "(<#1> * <#2>)",
    reportQuotient: "(<#1> / <#2>)",
    reportRound: "Math.round(<#1)",
    reportModulus: "(<#1> % <#2>)",
    reportMonadic: "this.callMathFunc('<#1>', <#2>)",
    reportRandom: "this.getRandom(<#1>, <#2>)",
    reportLessThan: "(<#1> < <#2>)",
    reportEquals: "(<#1> == <#2>)",
    reportGreaterThan: "(<#1> > <#2>)",
    reportAnd: "(<#1> && <#2>)",
    reportOr: "(<#1> || <#2>)",
    reportNot: "!(<#1>)",
    reportTrue: "true",
    reportFalse: "false",
    // reportJoinWords: "(<#1>, <#2>)",
    reportJoinWords: "[<#1>].join('')",
    reportTextSplit: "new List(<#1>.split(<#2>))",
    reportLetter: "<#2>[<#1> - 1]",
    reportStringSize: "(<#1>.length)",
    reportIsA: "this.isA(<#1>, '<#2>')",
    reportIsIdentical: "<#1> === <#2>",
    // reportJSFunction: 

// Variables
    doSetVar: "<#1> = <#2>;",
    doChangeVar: "<#1> += <#2>;",
    doShowVar: "this.showVar('<#1>');",
    doHideVar: "this.hideVar('<#1>');",
    doDeclareVariables: "var <#1>;",

    // Lists
    reportNewList: "[<#1>]",
    reportListItem: "<#2>[<#1> - 1]",
    reportListLength: "<#1>.length",
    doAddToList: "<#2>.push(<#1>);",
    reportCONS: "new List().cons(<#1>, <#2>)",
    reportCDR: "<#1>.cdr()",
    reportListContainsItem: "<#1>.contains(<#2>)",
    doDeleteFromList: "<#2>.remove(<#1>)",
    doInsertInList: "<#3>.add(<#1>, <#2>)",
    doReplaceInList: "<#2>.put(<#3>, <#1>)",

    // MAP 
    reportMap: "this.getProcess().reportMap(<#1>, <#2>);",
    doMapCodeOrHeader: "this.doMapCodeOrHeader(<#1>, <#2>, <#3>);",
    doMapListCode: "this.getProcess().doMapListCode(<#1>, <#2>, <#3>);",
    reportMappedCode: "this.getProcess().reportMappedCode(<#1>);",

    // operators
    // unclear what to do with these three
    string: "'<#1>'",
    tempvars_delim: ",",
    delim: ","
}