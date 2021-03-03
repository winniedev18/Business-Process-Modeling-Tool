
<!DOCTYPE html>
<html>
<head>
    <title>Business Process Modelling</title>
    <meta charset="utf-8">
    <link rel="stylesheet" type="text/css" href="styles/themes/proton/style.css">
    <link rel="stylesheet" type="text/css" href="styles/bpmStyle.css">
	
	<script type="text/javascript">
		// This is the side bar shape structure json.
		// we can replace it 
		var sideBarJSON = [
			{
				"shapeGroupName": "Activities",
				"shapeGroupId": "activities",
				"shapeGroupMemberIds": ['process', 'sub-process', 'user-input'],
				"shapeGroupMemberTitles": ['Process', 'Sub-Process', 'User Input'],
				"shapeGroupMemberImages": ['modelImg/process.png', 'modelImg/sub-process.png', 'modelImg/user-input.png']
			},
			{
				"shapeGroupName": "Event",
				"shapeGroupId": "event",
				"shapeGroupMemberIds": ['start-event', 'end-event', 'timer', 'recieve-message', 'send-message', 'rule'],
				"shapeGroupMemberTitles": ['Start Event', 'End Event', 'Timer', 'Recieve Message', 'Send Message', 'Rule'],
				"shapeGroupMemberImages": ['modelImg/event_start.png', 'modelImg/event_end.png', 'modelImg/timer.png', 'modelImg/message.png', 'modelImg/message_end.png', 'modelImg/rule.png']
			},
			{
				"shapeGroupName": "Geteways",
				"shapeGroupId": "geteways",
				"shapeGroupMemberIds": ['add', 'complex'],
				"shapeGroupMemberTitles": ['And', 'Complex'],
				"shapeGroupMemberImages": ['modelImg/and.png', 'modelImg/complex.png']
			}
		];
		
	</script>
	<script type="text/javascript" src="js/jquery.min.js"></script>
	<script src="js/jstree.js"></script>
	<script type="text/javascript" src="js/BpmInit.js"></script>
	<script type="text/javascript" src="js/jscolor/jscolor.js"></script>
	<script type="text/javascript" src="src/js/bpmCore.js"></script>
	<script type="text/javascript" src="js/BpmUi.js"></script>
	<script type="text/javascript" src="js/BpmDraw.js"></script>
	<script type="text/javascript" src="js/BpmSani.min.js"></script>
	<script type="text/javascript" src="js/BpmSidebar.js"></script>
	<script type="text/javascript" src="js/BpmGraph.js"></script>
	<script type="text/javascript" src="js/BpmScheme.js"></script>
	<script type="text/javascript" src="js/BpmElements.js"></script>
	<script type="text/javascript" src="js/BpmHandles.js"></script>
	<script type="text/javascript" src="js/bpmMenus.js"></script>
	<script type="text/javascript" src="js/BpmToolbar.js"></script>
	<script type='text/javascript' src="js/xml2json.js"></script>
	<script type='text/javascript' src="js/resources.js"></script>
</head>
<body class="editBody">
	
</body>
<script type="text/javascript" src="js/BpmModals.js"></script>
<</html>
