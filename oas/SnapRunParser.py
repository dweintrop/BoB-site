import xml.etree.ElementTree as ET

# from models import SnapRun

class SnapRunParser:
	
	def __init__(self, inSnapRun):
		self.snapRun = inSnapRun
		self.xml = inSnapRun.ScriptXML
		self.blockDict = SnapRunParser.getInitializeCounts()

	def getSnapRun(self):
		return self.snapRun

	@staticmethod
	def getRowMetaLabels():
		return ['id', 'StudentID', 'ProjectName', 'TimeStamp', 'RunType', 'NumRuns', 'TotalBlocks']

	def getRowMetaInfo(self):
		return [self.snapRun.id, self.snapRun.StudentID, self.snapRun.ProjectName, self.snapRun.TimeStamp, self.snapRun.RunType, self.snapRun.NumRuns]
		
	@staticmethod
	def getInitializeCounts():
		return {'forward': 0, 'turn': 0, 'turnLeft': 0, 'setHeading': 0, 'doFaceTowards': 0, 'gotoXY': 0, 'doGotoObject': 0, 'doGlide': 0, 'changeXPosition': 0, 'setXPosition': 0, 'changeYPosition': 0, 'setYPosition': 0, 'bounceOffEdge': 0, 'xPosition': 0, 'yPosition': 0, 'direction': 0, 'doSwitchToCostume': 0, 'doWearNextCostume': 0, 'getCostumeIdx': 0, 'doSayFor': 0, 'bubble': 0, 'doThinkFor': 0, 'doThink': 0, 'changeEffect': 0, 'setEffect': 0, 'clearEffects': 0, 'changeScale': 0, 'setScale': 0, 'getScale': 0, 'show': 0, 'hide': 0, 'comeToFront': 0, 'goBack': 0, 'playSound': 0, 'doPlaySoundUntilDone': 0, 'doStopAllSounds': 0, 'doRest': 0, 'doPlayNote': 0, 'doChangeTempo': 0, 'doSetTempo': 0, 'getTempo': 0, 'clear': 0, 'down': 0, 'up': 0, 'setColor': 0, 'changeHue': 0, 'setHue': 0, 'changeBrightness': 0, 'setBrightness': 0, 'changeSize': 0, 'setSize': 0, 'doStamp': 0, 'receiveGo': 0, 'receiveKey': 0, 'receiveClick': 0, 'receiveMessage': 0, 'doBroadcast': 0, 'doBroadcastAndWait': 0, 'getLastMessage'        : 0, 'doWait': 0, 'doWaitUntil': 0, 'doForever': 0, 'doRepeat': 0, 'doWhile': 0, 'doIf': 0, 'doIfElse': 0, 'doReport': 0, 'doWarp': 0, 'doStopThis': 0, 'doStopOthers': 0, 'doRun': 0, 'fork': 0, 'evaluate': 0, 'receiveOnClone': 0, 'createClone': 0, 'removeClone': 0, 'doPauseAll': 0, 'reportTouchingObject': 0, 'reportTouchingColor': 0, 'reportColorIsTouchingColor': 0, 'doAsk': 0, 'getLastAnswer': 0, 'reportMouseX': 0, 'reportMouseY': 0, 'reportMouseDown': 0, 'reportKeyPressed': 0, 'reportDistanceTo': 0, 'doResetTimer': 0, 'getTimer': 0, 'reportAttributeOf': 0, 'reportURL': 0, 'reportIsFastTracking': 0, 'doSetFastTracking': 0, 'reportDate': 0, 'reifyScript': 0, 'reifyReporter': 0, 'reifyPredicate': 0, 'reportSum': 0, 'reportDifference': 0, 'reportProduct': 0, 'reportQuotient': 0, 'reportModulus': 0, 'reportRound': 0, 'reportMonadic': 0, 'reportRandom': 0, 'reportLessThan': 0, 'reportEquals': 0, 'reportGreaterThan': 0, 'reportAnd': 0, 'reportOr': 0, 'reportNot': 0, 'reportTrue': 0, 'reportFalse': 0, 'reportJoinWords': 0, 'reportTextSplit': 0, 'reportLetter': 0, 'reportStringSize': 0, 'reportUnicode': 0, 'reportUnicodeAsLetter': 0, 'reportIsA': 0, 'reportMappedCmd': 0, 'reportMappedRep': 0, 'writeMappedCmd': 0, 'writeMappedRep': 0, 'doSetVar': 0, 'doChangeVar': 0, 'doShowVar': 0, 'doHideVar': 0, 'doDeclareVariables': 0, 'reportNewList': 0, 'reportCONS': 0, 'reportListItem': 0, 'reportCDR': 0, 'reportListLength': 0, 'reportListContainsItem': 0, 'doAddToList': 0, 'doDeleteFromList': 0, 'doInsertInList': 0, 'doReplaceInList': 0, 'doCallCC': 0, 'doUntil': 0, 'variables': 0, 'custom-blocks-used': 0, 'custom-blocks-defined': 0}

	@staticmethod
	def getBlockCountsLabels():
		return SnapRunParser.getInitializeCounts().keys()

	def getBlockCounts(self):
		root = ET.fromstring(self.xml)
		for block in root.findall(".//block"):

			# block names are stored in attr "s"
			blockName = block.get('s')
			if (blockName):
				if (blockName in self.blockDict) :
					self.blockDict[blockName] = self.blockDict[blockName] + 1
				else:
					print "didn't find: " + blockName
			else:

				# variable blocks have the variable name stored as attr var
				varName = block.get('var')
				if (varName):
					self.blockDict['variables'] = self.blockDict['variables'] + 1

		# custom blocks used
		customblocksUsed = root.findall(".//custom-block")
		if (customblocksUsed):
			self.blockDict['custom-blocks-used'] = len(customblocksUsed)
		
		totalBlocksUsed = sum(self.blockDict.values())
		
		# custom blocks defined
		customblocksDefinitions = root.findall(".//block-definition")
		if (customblocksDefinitions):
			self.blockDict['custom-blocks-defined'] = len(customblocksDefinitions)
		

		return [totalBlocksUsed] + self.blockDict.values()
