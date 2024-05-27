
function init()
{
	alert( 'Component task_assessment initializing...' );

	//tools_component.init_forms();

alert("url = "+task_assessment.append_component_relative_url( "/custom" ))
	tools.process_custom_packs( null, task_assessment.append_component_relative_url( "/custom" ) );

	alert( 'Component task_assessment initialized' );
}




function get_component_base_path()
{
	return "x-local://components/task_assessment";
}

function append_component_relative_url( url )
{
	return UrlAppendPath( task_assessment.get_component_base_path(), url );
}